package services

import (
	"errors"

	"github.com/fbisdevoptics/backend/internal/models"
	"github.com/fbisdevoptics/backend/internal/repositories"
)

// UserService defines business logic for users
type UserService interface {
	ListUsers() ([]*models.User, error)
	GetUser(id string) (*models.User, error)
	CreateUser(name, email string) (*models.User, error)
}

type userService struct {
	repo repositories.UserRepository
}

// NewUserService creates a new user service
func NewUserService(repo repositories.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) ListUsers() ([]*models.User, error) {
	return s.repo.GetAll()
}

func (s *userService) GetUser(id string) (*models.User, error) {
	if id == "" {
		return nil, errors.New("user ID cannot be empty")
	}
	return s.repo.GetByID(id)
}

func (s *userService) CreateUser(name, email string) (*models.User, error) {
	if name == "" || email == "" {
		return nil, errors.New("name and email are required")
	}

	user := &models.User{
		Name:  name,
		Email: email,
	}

	err := s.repo.Create(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}
