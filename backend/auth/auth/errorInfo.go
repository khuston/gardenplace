package auth

import (
	"errors"
	"log"
	"net/http"

	"github.com/khuston/gardenplace/unmarshal"
)

type FailedRequest struct {
	Msg string
}

func (mr *FailedRequest) Error() string {
	return mr.Msg
}

func handleError(err error, writer http.ResponseWriter) {
	var mr *unmarshal.MalformedRequest
	var fr *FailedRequest
	if errors.As(err, &mr) {
		http.Error(writer, mr.Msg, mr.Status)
	} else if errors.As(err, &fr) {
		http.Error(writer, fr.Msg, http.StatusOK)
	} else {
		log.Println(err.Error())
		http.Error(writer, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}
}
