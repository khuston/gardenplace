package authLib

import (
	"net/http"

	"github.com/khuston/gardenplace/comms"
	"golang.org/x/crypto/bcrypt"
)

type RegistrationHandler struct {
	DB             UserDB
	SendMail       func(to string, subject string, body string) error
	VerifyEndpoint string
}

// ServeHTTP fulfills an incoming registration request if valid.
func (handler RegistrationHandler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	payload := RegistrationPayload{}

	err := comms.DecodeJSONBody(request, &payload)
	if err == nil {
		err = payload.validate()
		if err == nil {
			err = registerUser(payload.Email, payload.Password, handler.DB)
			if err == nil {
				verificationCode, err := handler.DB.createEmailVerificationCode(payload.Email)
				if err == nil {
					verificationLink := handler.VerifyEndpoint + "?verification_code=" + verificationCode
					msg := "Your verification code:<br /><h2>" + verificationCode + "</h2><br />Or you can click this link: <a href=\"" + verificationLink +
						"\">" + verificationLink + "</a><br /><br />If you did not register for Gardenplace, then disregard this e-mail."
					err = handler.SendMail(payload.Email, "Verify Your E-Mail Address", msg)
					if err == nil {
						writer.WriteHeader(http.StatusCreated)
					}
				}
			}
		}
	}

	if err != nil {
		handleError(err, writer)
	}
}

func registerUser(email string, password string, db UserDB) error {
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)

	err := db.storeEmailAndHash(email, string(hash))

	return err
}
