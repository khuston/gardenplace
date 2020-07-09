package authLib

import (
	"net/http"

	"github.com/khuston/gardenplace/comms"
)

type LogoutHandler struct {
	DB            UserDB
	SecureCookies bool
}

type logoutResponseData struct {
	LoggedOut bool
}

func (handler LogoutHandler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {

	cookies, err := comms.LoadCookies(request, handler.SecureCookies)

	if err != nil {
		handleError(err, writer)
		return
	}

	err = handler.DB.revokeSessionToken(cookies.Email, cookies.Token)

	if err != nil {
		handleError(err, writer)
		return
	}

	cookies.Email = ""
	cookies.Token = nil
	cookies.Write(writer, 0, handler.SecureCookies)

	writer.WriteHeader(http.StatusOK)
}
