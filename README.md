# MyPlatform — Industry-Grade Monorepo

A production-oriented, modular React + Go monorepo scaffold for mid-size SaaS platforms.

## Architecture Overview

This monorepo follows a **modular-by-domain** architecture inspired by microservices and Kubernetes-style boundaries:

```
/
├── frontend/                   # React + Vite + Redux + Tailwind
│   ├── src/
│   │   ├── features/          # Business domain modules
│   │   │   ├── users/         # User management module
│   │   │   ├── billing/       # Billing management module
│   │   │   └── ...
│   │   ├── shared/            # Shared utilities and components
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   ├── components/
│   │   │   └── types/
│   │   └── core/              # Core infrastructure
│   │       ├── store/         # Redux store
│   │       ├── api/           # API client
│   │       └── config/        # Configuration
│   └── public/
│
├── backend/                   # Go + Gin + PostgreSQL + gRPC
│   ├── cmd/server/           # Application entry point
│   ├── internal/
│   │   ├── handlers/         # HTTP request handlers
│   │   ├── services/         # Business logic layer
│   │   ├── repositories/     # Data access layer
│   │   ├── models/           # Data structures
│   │   └── config/           # Configuration management
│   ├── pkg/                  # Shared Go packages (internal libraries)
│   ├── migrations/           # Database migrations (goose)
│   └── Makefile
│
├── docker-compose.yml        # Local development environment
├── Makefile                  # Root orchestration
├── .editorconfig             # Cross-editor configuration
└── README.md                 # This file
```

## Kubernetes Monitoring Module

The initial scaffold for the Kubernetes monitoring module lives in:

- Spec: `docs/kubernetes-monitoring/spec.md`
- Backend module: `backend/internal/modules/k8smonitoring/`
- Frontend module: `frontend/src/features/k8s-monitoring/`

## Key Design Decisions

### Frontend

- **Vite + React 18**: Modern, fast bundler for optimal DX and build times.
- **TypeScript**: Type safety across the entire codebase.
- **Redux Toolkit**: Centralized state management with minimal boilerplate.
- **React Router v6**: Client-side routing with nested routes.
- **Tailwind CSS**: Utility-first CSS for rapid UI development.
- **ESLint (strict)**: Enforces code quality and consistency.
- **Feature-based modules**: Each business domain owns its routes, components, and state.

### Backend

- **Gin Framework**: Lightweight, high-performance HTTP framework.
- **Standard Go layout**: Follows [golang-standards/project-layout](https://github.com/golang-standards/project-layout).
- **Interface-driven design**: Repositories and services use interfaces to decouple layers.
- **Viper**: Configuration management with YAML, environment variables, and defaults.
- **zap**: Structured logging for observability.
- **JWT scaffolding**: Auth token generation and validation ready to implement.
- **gRPC ready**: Side-by-side REST and gRPC servers.
- **goose migrations**: Database schema versioning.

### Monorepo Strategy

- **Single repository**: Shared tooling, easier onboarding, single source of truth.
- **Modular by domain**: Features are self-contained; easy to extract into microservices later.
- **Loose coupling**: Services communicate via well-defined interfaces and APIs.
- **Independent deployment**: Frontend and backend can be deployed separately.

## Quick Start

### Prerequisites

- **Node.js**: 18+ LTS
- **Go**: 1.21+
- **Docker** & **Docker Compose**: (optional, for containerized dev)
- **PostgreSQL**: 15+ (or use Docker Compose)

### 1. Install Dependencies

```bash
make install
```

This installs:
- Frontend: npm packages
- Backend: Go modules

### 2. Start Development Servers

#### Option A: Local Development (Recommended)

```bash
# Terminal 1: Start backend
make backend-dev

# Terminal 2: Start frontend
make frontend-dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/v1
- Health check: http://localhost:8080/health

#### Option B: Docker Compose

```bash
make docker-up
```

Services:
- PostgreSQL: `localhost:5432` (postgres/postgres)
- Backend: `localhost:8080`
- Frontend: `localhost:3000`

Stop with: `make docker-down`

### 3. Verify Setup

```bash
# Health check
curl http://localhost:8080/health

# List users (empty initially)
curl http://localhost:8080/api/v1/users
```

---

## How to Add a New Module

### Frontend Module

1. **Create feature directory**:

   ```bash
   mkdir -p frontend/src/features/myfeature
   mkdir -p frontend/src/features/myfeature/{pages,store,components,hooks}
   ```

2. **Create store slice** (Redux):

   ```typescript
   // frontend/src/features/myfeature/store/myfeatureSlice.ts
   import { createSlice } from '@reduxjs/toolkit'

   const initialState = {}

   const myfeatureSlice = createSlice({
     name: 'myfeature',
     initialState,
     reducers: {},
   })

   export default myfeatureSlice.reducer
   ```

3. **Register in store**:

   ```typescript
   // frontend/src/core/store/index.ts
   import myfeatureReducer from '@features/myfeature/store/myfeatureSlice'

   const store = configureStore({
     reducer: {
       myfeature: myfeatureReducer,
     },
   })
   ```

4. **Create index.tsx** for routing:

   ```typescript
   // frontend/src/features/myfeature/index.tsx
   import { Routes, Route } from 'react-router-dom'
   import MyFeaturePage from './pages/MyFeaturePage'

   export default function MyFeatureModule() {
     return (
       <Routes>
         <Route path="/" element={<MyFeaturePage />} />
       </Routes>
     )
   }
   ```

5. **Register route in App.tsx**:

   ```typescript
   <Route path="/myfeature/*" element={<MyFeatureModule />} />
   ```

### Backend Module

1. **Create repository interface**:

   ```go
   // backend/internal/repositories/myfeature_repository.go
   package repositories

   type MyFeatureRepository interface {
       GetAll() ([]interface{}, error)
       GetByID(id string) (interface{}, error)
   }

   type myfeatureRepository struct{}

   func NewMyFeatureRepository() MyFeatureRepository {
       return &myfeatureRepository{}
   }

   func (r *myfeatureRepository) GetAll() ([]interface{}, error) {
       // TODO: Implement
       return []interface{}{}, nil
   }
   ```

2. **Create service**:

   ```go
   // backend/internal/services/myfeature_service.go
   package services

   import "internal/repositories"

   type MyFeatureService interface {
       ListItems() ([]interface{}, error)
   }

   type myfeatureService struct {
       repo repositories.MyFeatureRepository
   }

   func NewMyFeatureService(repo repositories.MyFeatureRepository) MyFeatureService {
       return &myfeatureService{repo: repo}
   }

   func (s *myfeatureService) ListItems() ([]interface{}, error) {
       return s.repo.GetAll()
   }
   ```

3. **Create HTTP handler**:

   ```go
   // backend/internal/handlers/myfeature_handler.go
   package handlers

   import (
       "github.com/gin-gonic/gin"
       "internal/services"
   )

   type MyFeatureHandler struct {
       service services.MyFeatureService
   }

   func NewMyFeatureHandler(service services.MyFeatureService) *MyFeatureHandler {
       return &MyFeatureHandler{service: service}
   }

   func (h *MyFeatureHandler) List(c *gin.Context) {
       items, err := h.service.ListItems()
       if err != nil {
           c.JSON(500, gin.H{"error": err.Error()})
           return
       }
       c.JSON(200, items)
   }
   ```

4. **Register routes in main.go**:

   ```go
   myfeatureRepo := repositories.NewMyFeatureRepository()
   myfeatureService := services.NewMyFeatureService(myfeatureRepo)
   myfeatureHandler := handlers.NewMyFeatureHandler(myfeatureService)

   myfeature := apiV1.Group("/myfeature")
   {
       myfeature.GET("", myfeatureHandler.List)
   }
   ```

---

## Frontend & Backend Communication

### REST API Contract

The frontend consumes the backend's REST API via HTTP:

```
Base URL: http://localhost:8080/api/v1

Endpoints:
  GET    /health              → Health check
  GET    /users              → List all users
  GET    /users/:id          → Get user by ID
  POST   /users              → Create user
  GET    /billing            → List invoices
  POST   /billing            → Create invoice
```

### API Client Setup

The frontend uses `axios` with interceptors for:
- **Request**: Attaching JWT tokens
- **Response**: Handling 401 Unauthorized errors

See `frontend/src/core/api/client.ts` for implementation.

### Error Handling

Both layers use standard HTTP status codes:
- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `404` Not Found
- `500` Internal Server Error

---

## Testing

### Frontend

```bash
cd frontend && npm test
```

No tests are written yet; scaffold as needed with Vitest.

### Backend

```bash
cd backend && go test ./...
```

No tests are written yet; scaffold with `*_test.go` files.

---

## Configuration

### Frontend

Environment variables (create `.env.local`):

```
REACT_APP_API_URL=http://localhost:8080/api/v1
```

### Backend

Configuration is loaded from `backend/config.yaml` (create from example):

```bash
cp backend/config.yaml.example backend/config.yaml
```

Or set environment variables:

```bash
export APP_ENV=production
export DB_HOST=prod-db.example.com
export DB_USER=produser
```

---

## Security Baseline

This scaffold includes:

- ✅ **ESLint strict mode**: Enforces code quality.
- ✅ **TypeScript**: Type safety.
- ✅ **CORS middleware**: Configured on backend.
- ✅ **Environment variables**: For secrets (`.env`, `.env.local`).
- ✅ **JWT scaffolding**: Ready to implement auth.
- ✅ **Structured logging**: Via zap in backend.
- ✅ **Health checks**: `/health` endpoint.
- ✅ **Git hooks ready**: Use lefthook or husky.

**⚠️ Before Production:**

1. Change `auth.jwt_secret` in `backend/config.yaml`
2. Set up database backups
3. Configure CORS for your domain
4. Enable HTTPS
5. Set up monitoring and alerting
6. Add rate limiting
7. Review and fix any TODOs in the code

---

## Removing Example Modules

### Remove Users Module

```bash
# Frontend
rm -rf frontend/src/features/users

# Backend
rm backend/internal/handlers/user_handler.go
rm backend/internal/services/user_service.go
rm backend/internal/repositories/user_repository.go

# Remove imports and routes from main.go
```

### Remove Billing Module

```bash
# Frontend
rm -rf frontend/src/features/billing

# Update App.tsx to remove route
```

---

## Useful Commands

```bash
# Root level
make help              # Show available commands
make install           # Install all dependencies
make dev               # Run both servers in parallel
make docker-up         # Start with Docker Compose
make lint              # Run linters
make test              # Run tests
make clean             # Clean artifacts

# Frontend only
cd frontend && npm run dev        # Development server
cd frontend && npm run build      # Production build
cd frontend && npm run lint       # ESLint
cd frontend && npm run lint:fix   # Auto-fix

# Backend only
cd backend && make build          # Compile binary
cd backend && make run            # Run server
cd backend && make test           # Run tests
cd backend && make migrate-up     # Run migrations
```

---

## Troubleshooting

### Port Already in Use

If port 3000 or 8080 is occupied:

```bash
# Find process on port 8080
lsof -i :8080

# Kill it
kill -9 <PID>
```

Or change ports in environment variables:

```bash
export SERVER_PORT=8081
```

### Database Connection Error

Ensure PostgreSQL is running:

```bash
# With Docker Compose
docker-compose up postgres

# Or check your local PostgreSQL service
brew services list  # macOS
```

### Module Not Found Errors (Frontend)

Clear node_modules and reinstall:

```bash
cd frontend && rm -rf node_modules package-lock.json && npm install
```

### Go Build Errors

Ensure Go modules are synced:

```bash
cd backend && go mod tidy && go mod download
```

---

## Next Steps

1. **Add example data**: Update repositories to query actual database
2. **Implement authentication**: Use JWT scaffolding
3. **Add tests**: Write unit and integration tests
4. **Configure CI/CD**: GitHub Actions, GitLab CI, etc.
5. **Deploy**: Use Docker Compose or Kubernetes
6. **Monitor**: Add metrics, tracing, and alerting

---

## License

MIT. Modify and distribute freely.

---

## Support

For questions or issues with this scaffold, refer to:
- React: https://react.dev
- Vite: https://vitejs.dev
- Redux Toolkit: https://redux-toolkit.js.org
- Gin: https://gin-gonic.com
- Go: https://golang.org
