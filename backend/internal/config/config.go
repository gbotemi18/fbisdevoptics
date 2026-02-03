package config

import (
	"fmt"

	"github.com/spf13/viper"
)

type Config struct {
	Environment string
	Server      ServerConfig
	Database    DatabaseConfig
	GRPC        GRPCConfig
	Auth        AuthConfig
}

type ServerConfig struct {
	Port int
}

type DatabaseConfig struct {
	Driver   string
	Host     string
	Port     int
	User     string
	Password string
	Database string
}

type GRPCConfig struct {
	Enabled bool
	Port    int
}

type AuthConfig struct {
	JWTSecret string
}

func Load() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("../")
	viper.AddConfigPath("../../")

	// Set defaults
	viper.SetDefault("environment", "development")
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("database.driver", "postgres")
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", 5432)
	viper.SetDefault("database.user", "postgres")
	viper.SetDefault("database.password", "postgres")
	viper.SetDefault("database.database", "myapp")
	viper.SetDefault("grpc.enabled", false)
	viper.SetDefault("grpc.port", 50051)
	viper.SetDefault("auth.jwt_secret", "your-secret-key-change-this")

	// Read environment variables
	viper.BindEnv("environment", "APP_ENV")
	viper.BindEnv("server.port", "SERVER_PORT")
	viper.BindEnv("database.host", "DB_HOST")
	viper.BindEnv("database.port", "DB_PORT")
	viper.BindEnv("database.user", "DB_USER")
	viper.BindEnv("database.password", "DB_PASSWORD")
	viper.BindEnv("database.database", "DB_NAME")

	// Try to read config file, but don't fail if it doesn't exist
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
		// Config file not found; use defaults and environment variables
	}

	cfg := &Config{
		Environment: viper.GetString("environment"),
		Server: ServerConfig{
			Port: viper.GetInt("server.port"),
		},
		Database: DatabaseConfig{
			Driver:   viper.GetString("database.driver"),
			Host:     viper.GetString("database.host"),
			Port:     viper.GetInt("database.port"),
			User:     viper.GetString("database.user"),
			Password: viper.GetString("database.password"),
			Database: viper.GetString("database.database"),
		},
		GRPC: GRPCConfig{
			Enabled: viper.GetBool("grpc.enabled"),
			Port:    viper.GetInt("grpc.port"),
		},
		Auth: AuthConfig{
			JWTSecret: viper.GetString("auth.jwt_secret"),
		},
	}

	return cfg, nil
}
