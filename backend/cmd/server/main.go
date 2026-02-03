package main

import (
	"context"
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
	"google.golang.org/grpc"
	"go.uber.org/zap"

	"github.com/fbisdevoptics/backend/internal/config"
	"github.com/fbisdevoptics/backend/internal/handlers"
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

	// Register routes
	apiV1 := router.Group("/api/v1")
	{
		users := apiV1.Group("/users")
		{
			users.GET("", userHandler.ListUsers)
			users.GET("/:id", userHandler.GetUser)
			users.POST("", userHandler.CreateUser)
		}

		k8s := apiV1.Group("/k8s")
		{
			k8s.GET("/health/:cluster", k8sHealthHandler.GetClusterHealth)
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
		"status": "healthy",
		"timestamp": time.Now(),
	})
}
