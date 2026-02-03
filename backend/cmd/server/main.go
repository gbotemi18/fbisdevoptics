package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/fbisdevoptics/backend/internal/config"
	"github.com/fbisdevoptics/backend/internal/handlers"
	authhandlers "github.com/fbisdevoptics/backend/internal/modules/auth/handlers"
	authrepositories "github.com/fbisdevoptics/backend/internal/modules/auth/repositories"
	authservices "github.com/fbisdevoptics/backend/internal/modules/auth/services"
	k8smonitoringhandlers "github.com/fbisdevoptics/backend/internal/modules/k8smonitoring/handlers"
	k8smonitoringservices "github.com/fbisdevoptics/backend/internal/modules/k8smonitoring/services"
	"github.com/fbisdevoptics/backend/internal/repositories"
	"github.com/fbisdevoptics/backend/internal/services"
)

func main() {
	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	sugar := logger.Sugar()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		sugar.Fatalf("Failed to load configuration: %v", err)
	}

	sugar.Infow("Server starting",
		"environment", cfg.Environment,
		"port", cfg.Server.Port,
	)

	// Setup HTTP server
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	// Middleware
	router.Use(corsMiddleware())
	router.Use(loggingMiddleware(logger))

	// Health check endpoint
	router.GET("/health", healthCheckHandler)

	// Initialize repositories and services
	userRepo := repositories.NewUserRepository()
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)
	k8sHealthService := k8smonitoringservices.NewHealthService()
	k8sHealthHandler := k8smonitoringhandlers.NewHealthHandler(k8sHealthService)
	db, err := initDB(cfg)
	if err != nil {
		sugar.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	if err := ensureAuthSchema(db); err != nil {
		sugar.Fatalf("Failed to ensure auth schema: %v", err)
	}

	authRepo := authrepositories.NewUserRepository(db)
	authService := authservices.NewAuthService(authRepo, cfg.Auth.JWTSecret)
	authHandler := authhandlers.NewAuthHandler(authService)
	authMiddleware := authhandlers.NewAuthMiddleware(authService)

	// Register routes
	apiV1 := router.Group("/api/v1")
	{
		users := apiV1.Group("/users")
		{
			users.GET("", userHandler.ListUsers)
			users.GET("/:id", userHandler.GetUser)
			users.POST("", userHandler.CreateUser)
		}

		auth := apiV1.Group("/auth")
		{
			auth.POST("/signup", authHandler.SignUp)
			auth.POST("/login", authHandler.Login)
		}

		protected := apiV1.Group("/")
		protected.Use(authMiddleware.RequireAuth())
		{
			k8sProtected := protected.Group("/k8s")
			{
				k8sProtected.GET("/health/:cluster", k8sHealthHandler.GetClusterHealth)
			}

			admin := protected.Group("/admin")
			admin.Use(authMiddleware.RequireRole("admin"))
			{
				admin.GET("/overview", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"message": "admin access granted"})
				})
			}
		}
	}

	// Start HTTP server in goroutine
	httpServer := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.Server.Port),
		Handler: router,
	}

	var wg sync.WaitGroup
	serverErrors := make(chan error, 1)

	wg.Add(1)
	go func() {
		defer wg.Done()
		sugar.Infow("HTTP server listening", "port", cfg.Server.Port)
		serverErrors <- httpServer.ListenAndServe()
	}()

	// gRPC server setup (if enabled)
	if cfg.GRPC.Enabled {
		wg.Add(1)
		go func() {
			defer wg.Done()
			listener, err := net.Listen("tcp", fmt.Sprintf(":%d", cfg.GRPC.Port))
			if err != nil {
				serverErrors <- fmt.Errorf("failed to listen on gRPC port: %w", err)
				return
			}

			grpcServer := grpc.NewServer()
			sugar.Infow("gRPC server listening", "port", cfg.GRPC.Port)

			// Register gRPC services here
			serverErrors <- grpcServer.Serve(listener)
		}()
	}

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-sigChan:
		sugar.Infow("Shutting down", "signal", sig)
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		httpServer.Shutdown(ctx)
	case err := <-serverErrors:
		if err != nil && err != http.ErrServerClosed {
			sugar.Errorw("Server error", "error", err)
		}
	}

	wg.Wait()
	sugar.Info("Server stopped")
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func loggingMiddleware(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		logger.Info("HTTP request",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
		)
	}
}

func healthCheckHandler(c *gin.Context) {
	c.JSON(200, gin.H{
		"status":    "healthy",
		"timestamp": time.Now(),
	})
}

func initDB(cfg *config.Config) (*sql.DB, error) {
	connStr := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Database,
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}

func ensureAuthSchema(db *sql.DB) error {
	_, err := db.Exec(`
CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`)
	return err
}
