package auth

import (
	"errors"
	"log"
	"net/http"

	"github.com/khuston/gardenplace/unmarshal"
	"golang.org/x/crypto/bcrypt"
)

type RegistrationHandler struct {
	DB UserDB
}

// ServeHTTP fulfills an incoming registration request if valid.
func (handler RegistrationHandler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	payload := RegistrationPayload{}

	err := unmarshal.DecodeJSONBody(request, &payload)
	if err == nil {
		err = payload.validate()
		if err == nil {
			err = registerUser(payload.Email, payload.Password, handler.DB)

			writer.WriteHeader(http.StatusCreated)
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

func handleError(err error, writer http.ResponseWriter) {
	var mr *unmarshal.MalformedRequest
	if errors.As(err, &mr) {
		http.Error(writer, mr.Msg, mr.Status)
	} else {
		log.Println(err.Error())
		http.Error(writer, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}
}
