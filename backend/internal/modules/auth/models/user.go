package models

type User struct {
	ID           string `json:"id"`
	FullName     string `json:"fullName"`
	Email        string `json:"email"`
	Role         string `json:"role"`
	PasswordHash string `json:"-"`
}

const (
	RoleAdmin   = "admin"
	RoleManager = "manager"
	RoleAnalyst = "analyst"
	RoleViewer  = "viewer"
)
