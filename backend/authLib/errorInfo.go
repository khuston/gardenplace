package authLib

import (
	"errors"
	"log"
	"net/http"

	"github.com/khuston/gardenplace/comms"
)

type FailedRequest struct {
	Msg string
}

type NonceError struct {
}

type InvalidLogin struct {
}

func (mr *FailedRequest) Error() string {
	return mr.Msg
}

func (ne *NonceError) Error() string {
	return "Unexpected Nonce Value"
}

func (il *InvalidLogin) Error() string {
	return "There was a problem logging in with this e-mail/password combination."
}

func handleError(err error, writer http.ResponseWriter) {
	var mr *comms.MalformedRequest
	var fr *FailedRequest
	var ne *NonceError
	var il *InvalidLogin
	if errors.As(err, &mr) {
		http.Error(writer, mr.Msg, mr.Status)
	} else if errors.As(err, &fr) {
		http.Error(writer, fr.Msg, http.StatusOK)
	} else if errors.As(err, &ne) {
		http.Error(writer, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
	} else if errors.As(err, &il) {
		http.Error(writer, il.Error(), http.StatusUnauthorized)
	} else {
		log.Println("[ERROR]", err.Error())
		http.Error(writer, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}
}
