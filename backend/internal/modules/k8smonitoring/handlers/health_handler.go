package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/fbisdevoptics/backend/internal/modules/k8smonitoring/services"
)

type HealthHandler struct {
	service services.HealthService
}

func NewHealthHandler(service services.HealthService) *HealthHandler {
	return &HealthHandler{service: service}
}

// GetClusterHealth returns a basic health snapshot for a cluster.
func (h *HealthHandler) GetClusterHealth(c *gin.Context) {
	cluster := c.Param("cluster")
	if cluster == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cluster name is required"})
		return
	}

	snapshot := h.service.GetClusterHealth(cluster)
	c.JSON(http.StatusOK, snapshot)
}
