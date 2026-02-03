FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/server cmd/server/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/bin/server .
COPY --from=builder /app/config.yaml.example ./config.yaml

EXPOSE 8080 50051

CMD ["./server"]
