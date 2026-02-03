package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/fbisdevoptics/backend/internal/modules/auth/services"
)

type AuthMiddleware struct {
	service services.AuthService
}

func NewAuthMiddleware(service services.AuthService) *AuthMiddleware {
	return &AuthMiddleware{service: service}
}

func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractBearerToken(c.GetHeader("Authorization"))
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing auth token"})
			c.Abort()
			return
		}

		claims, role, err := m.service.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}

		c.Set("auth.sub", claims.Subject)
		c.Set("auth.role", role)
		c.Next()
	}
}

func (m *AuthMiddleware) RequireRole(roles ...string) gin.HandlerFunc {
	roleSet := map[string]bool{}
	for _, role := range roles {
		roleSet[role] = true
	}

	return func(c *gin.Context) {
		role, ok := c.Get("auth.role")
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "missing role"})
			c.Abort()
			return
		}

		roleStr, _ := role.(string)
		if !roleSet[roleStr] {
			c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
			c.Abort()
			return
		}
		c.Next()
	}
}

func extractBearerToken(header string) string {
	if header == "" {
		return ""
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return ""
	}
	return parts[1]
}
