package authLib

import (
	"net/http"

	"github.com/khuston/gardenplace/comms"
	"golang.org/x/crypto/bcrypt"
)

type RegistrationHandler struct {
	DB       UserDB
	SendMail func(to string, body []byte) error
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
				err = handler.SendMail(payload.Email, []byte("Hello"))
				if err == nil {
					writer.WriteHeader(http.StatusCreated)
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
