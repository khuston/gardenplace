package auth

import (
	"fmt"
	"net/http"

	"github.com/khuston/gardenplace/unmarshal"
)

// RegistrationPayload holds data for registering a new user
type RegistrationPayload struct {
	Email             string
	Password          string
	PasswordReentered string
	SessionID         int64
}

func (payload RegistrationPayload) validate() error {
	if payload.Password != payload.PasswordReentered {
		msg := fmt.Sprintf("Re-entered password does not match")
		return &unmarshal.MalformedRequest{Status: http.StatusBadRequest, Msg: msg}
	}

	return nil
}
