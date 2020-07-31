package authLib

import (
	"fmt"
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

		fmt.Println("[OK] JSON payload decoded. Validating...")

		err = payload.validate()

		if err == nil {

			fmt.Println("[OK] JSON payload validated. Attempting to register user...")

			err = registerUser(payload.Email, payload.Password, handler.DB)

			if err == nil {

				fmt.Println("[OK] User was successfully registered. Attempting to create verification code...")

				verificationCode, err := handler.DB.createEmailVerificationCode(payload.Email)

				if err == nil {

					fmt.Println("[OK] Verification code created. Attempting to send mail...")

					verificationLink := handler.VerifyEndpoint + "?verification_code=" + verificationCode

					msg := "Your verification code:<br /><h2>" + verificationCode + "</h2><br />Or you can click this link: <a href=\"" + verificationLink +
						"\">" + verificationLink + "</a><br /><br />If you did not register for Gardenplace, then disregard this e-mail."

					err = handler.SendMail(payload.Email, "Verify Your E-Mail Address", msg)

					if err == nil {

						fmt.Println("[OK] Mail sent. Sending response...")

						writer.WriteHeader(http.StatusCreated)
					}
				}
			}
		}
	}

	if err != nil {
		fmt.Println("[INFO]", err)
		handleError(err, writer)
	}
}

func registerUser(email string, password string, db UserDB) error {
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)

	err := db.storeEmailAndHash(email, string(hash))

	return err
}
