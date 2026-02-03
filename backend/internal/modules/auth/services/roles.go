package services

import "github.com/fbisdevoptics/backend/internal/modules/auth/models"

func IsValidRole(role string) bool {
	switch role {
	case models.RoleAdmin, models.RoleManager, models.RoleAnalyst, models.RoleViewer:
		return true
	default:
		return false
	}
}
