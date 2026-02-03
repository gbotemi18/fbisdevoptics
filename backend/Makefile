.PHONY: help build run test clean lint migrate

help:
	@echo "Available targets:"
	@echo "  build       - Build the backend binary"
	@echo "  run         - Run the backend server"
	@echo "  test        - Run tests"
	@echo "  clean       - Clean build artifacts"
	@echo "  lint        - Run linters"
	@echo "  migrate-up  - Run database migrations"
	@echo "  migrate-down- Rollback database migrations"

build:
	go build -o bin/server cmd/server/main.go

run:
	go run cmd/server/main.go

test:
	go test ./...

clean:
	rm -rf bin/

lint:
	golangci-lint run ./...

migrate-up:
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/myapp?sslmode=disable" up

migrate-down:
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/myapp?sslmode=disable" down
