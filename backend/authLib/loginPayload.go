package authLib

// LoginPayload holds data for registering a new user
type LoginPayload struct {
	GetNonce bool
	Email    string
	Password string
}
