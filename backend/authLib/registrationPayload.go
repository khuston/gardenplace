package authLib

import (
	"net/http"
	"net/mail"

	"github.com/khuston/gardenplace/comms"
)

// RegistrationPayload holds data for registering a new user
type RegistrationPayload struct {
	Email             string
	Password          string
	PasswordReentered string
	SessionID         int64
}

func (payload *RegistrationPayload) validate() error {

	// Validate e-mail address
	validatedEmail, err := mail.ParseAddress(payload.Email)

	payload.Email = validatedEmail.Address // todo: check that this actually does something, e.g. removes whitespace

	if err != nil {
		return &comms.MalformedRequest{Status: http.StatusBadRequest, Msg: "E-mail address is not valid"}
	}

	// Validate pasword
	if len(payload.Password) < 1 {
		return &comms.MalformedRequest{Status: http.StatusBadRequest, Msg: "Blank password is not allowed"}
	}

	if payload.Password != payload.PasswordReentered {
		return &comms.MalformedRequest{Status: http.StatusBadRequest, Msg: "Re-entered password does not match"}
	}

	return nil
}

func validateEmailAddress(emailAddress string) (string, error) {
	validatedEmail, err := mail.ParseAddress(emailAddress)

	return validatedEmail.Address, err
}
