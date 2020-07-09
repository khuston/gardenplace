package authLib

import (
	"net/http"

	"github.com/khuston/gardenplace/comms"
)

type VerifyHandler struct {
	DB UserDB
}

type VerifyPayload struct {
	VerificationCode string
}

func (handler VerifyHandler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {

	payload := VerifyPayload{}

	err := comms.DecodeJSONBody(request, &payload)

	if err != nil {
		handleError(err, writer)
		return
	}

	err = handler.DB.verifyEmail(payload.VerificationCode)

	if err != nil {
		handleError(err, writer)
		return
	}

	writer.WriteHeader(http.StatusOK)
}
