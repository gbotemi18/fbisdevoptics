package repositories

import (
	"database/sql"
	"errors"

	"github.com/fbisdevoptics/backend/internal/modules/auth/models"
)

var ErrUserNotFound = errors.New("user not found")

// UserRepository persists auth users.
type UserRepository interface {
	Create(user models.User) (models.User, error)
	GetByEmail(email string) (models.User, error)
	GetByID(id string) (models.User, error)
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user models.User) (models.User, error) {
	_, err := r.db.Exec(
		`INSERT INTO auth_users (id, full_name, email, password_hash, role)
		 VALUES ($1, $2, $3, $4, $5)`,
		user.ID, user.FullName, user.Email, user.PasswordHash, user.Role,
	)
	return user, err
}

func (r *userRepository) GetByEmail(email string) (models.User, error) {
	row := r.db.QueryRow(
		`SELECT id, full_name, email, password_hash, role FROM auth_users WHERE email = $1`,
		email,
	)

	var user models.User
	if err := row.Scan(&user.ID, &user.FullName, &user.Email, &user.PasswordHash, &user.Role); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.User{}, ErrUserNotFound
		}
		return models.User{}, err
	}
	return user, nil
}

func (r *userRepository) GetByID(id string) (models.User, error) {
	row := r.db.QueryRow(
		`SELECT id, full_name, email, password_hash, role FROM auth_users WHERE id = $1`,
		id,
	)

	var user models.User
	if err := row.Scan(&user.ID, &user.FullName, &user.Email, &user.PasswordHash, &user.Role); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.User{}, ErrUserNotFound
		}
		return models.User{}, err
	}
	return user, nil
}
