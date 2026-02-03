package services

import (
	"time"

	"github.com/fbisdevoptics/backend/internal/modules/k8smonitoring/models"
)

// HealthService provides health snapshots for Kubernetes clusters.
type HealthService interface {
	GetClusterHealth(clusterName string) models.ClusterHealth
}

type healthService struct{}

// NewHealthService returns a new HealthService.
func NewHealthService() HealthService {
	return &healthService{}
}

func (s *healthService) GetClusterHealth(clusterName string) models.ClusterHealth {
	return models.ClusterHealth{
		ClusterName: clusterName,
		Status:      "unknown",
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Signals: map[string]string{
			"note": "k8s monitoring module scaffold (no collectors wired yet)",
		},
	}
}
