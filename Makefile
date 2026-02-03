.PHONY: help install dev frontend-dev backend-dev docker-up docker-down clean lint test

help:
	@echo "Available targets:"
	@echo "  install         - Install dependencies for frontend and backend"
	@echo "  frontend-dev    - Run frontend development server"
	@echo "  backend-dev     - Run backend development server"
	@echo "  dev             - Run both frontend and backend in parallel"
	@echo "  docker-up       - Start services with Docker Compose"
	@echo "  docker-down     - Stop services with Docker Compose"
	@echo "  lint            - Run linters"
	@echo "  test            - Run tests"
	@echo "  clean           - Clean all build artifacts"

install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && go mod download

frontend-dev:
	cd frontend && npm run dev

backend-dev:
	cd backend && go run cmd/server/main.go

dev:
	@echo "Starting development servers..."
	@echo "Frontend will be available at http://localhost:3000"
	@echo "Backend API will be available at http://localhost:8080/api/v1"
	@echo "Press Ctrl+C to stop both servers"
	@(cd frontend && npm run dev) & (cd backend && go run cmd/server/main.go)

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

lint:
	@echo "Linting frontend..."
	cd frontend && npm run lint
	@echo "Linting backend..."
	cd backend && golangci-lint run ./... || true

test:
	@echo "Testing frontend..."
	cd frontend && npm test || true
	@echo "Testing backend..."
	cd backend && go test ./...

clean:
	@echo "Cleaning up..."
	cd frontend && rm -rf node_modules dist
	cd backend && rm -rf bin/
	docker-compose down --volumes || true
