package services

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/fbisdevoptics/backend/internal/modules/auth/models"
	"github.com/fbisdevoptics/backend/internal/modules/auth/repositories"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailExists        = errors.New("email already exists")
)

type AuthService interface {
	SignUp(fullName, email, password, role string) (models.User, string, error)
	Login(email, password string) (models.User, string, error)
	ValidateToken(token string) (*jwt.RegisteredClaims, string, error)
	ListUsers() ([]models.User, error)
	UpdateRole(id, role string) error
}

type authService struct {
	repo      repositories.UserRepository
	jwtSecret []byte
}

func NewAuthService(repo repositories.UserRepository, jwtSecret string) AuthService {
	return &authService{repo: repo, jwtSecret: []byte(jwtSecret)}
}

func (s *authService) SignUp(fullName, email, password, role string) (models.User, string, error) {
	if role == "" {
		role = models.RoleViewer
	}
	if !IsValidRole(role) {
		return models.User{}, "", errors.New("invalid role")
	}

	if _, err := s.repo.GetByEmail(email); err == nil {
		return models.User{}, "", ErrEmailExists
	} else if !errors.Is(err, repositories.ErrUserNotFound) {
		return models.User{}, "", err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return models.User{}, "", err
	}

	user := models.User{
		ID:           newID(),
		FullName:     fullName,
		Email:        email,
		PasswordHash: string(hash),
		Role:         role,
	}

	created, err := s.repo.Create(user)
	if err != nil {
		return models.User{}, "", err
	}

	token, err := s.issueToken(created)
	if err != nil {
		return models.User{}, "", err
	}

	created.PasswordHash = ""
	return created, token, nil
}

func (s *authService) Login(email, password string) (models.User, string, error) {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return models.User{}, "", ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return models.User{}, "", ErrInvalidCredentials
	}

	token, err := s.issueToken(user)
	if err != nil {
		return models.User{}, "", err
	}

	user.PasswordHash = ""
	return user, token, nil
}

func (s *authService) ValidateToken(token string) (*jwt.RegisteredClaims, string, error) {
	parsed, err := jwt.ParseWithClaims(token, &jwt.RegisteredClaims{}, func(t *jwt.Token) (interface{}, error) {
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, "", err
	}

	claims, ok := parsed.Claims.(*jwt.RegisteredClaims)
	if !ok || !parsed.Valid {
		return nil, "", ErrInvalidCredentials
	}

	role, _ := parsed.Claims.(jwt.MapClaims)["role"].(string)
	return claims, role, nil
}

func (s *authService) ListUsers() ([]models.User, error) {
	users, err := s.repo.List()
	if err != nil {
		return nil, err
	}

	for i := range users {
		users[i].PasswordHash = ""
	}
	return users, nil
}

func (s *authService) UpdateRole(id, role string) error {
	if !IsValidRole(role) {
		return errors.New("invalid role")
	}
	return s.repo.UpdateRole(id, role)
}

func (s *authService) issueToken(user models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":   user.ID,
		"role":  user.Role,
		"email": user.Email,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(s.jwtSecret)
}
