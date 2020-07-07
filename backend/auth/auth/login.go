package auth

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"net"
	"net/http"

	"github.com/khuston/gardenplace/unmarshal"
	"golang.org/x/crypto/bcrypt"
)

type LoginHandler struct {
	DB            UserDB
	SecureCookies bool
}

type loginResponseData struct {
	ValidEmailPasswordCombination bool
	LoggedIn                      bool
	RequireTwoFactor              bool
}

// ServeHTTP fulfills an incoming login request if valid.
func (handler LoginHandler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	payload := LoginPayload{}

	fmt.Println(request.RemoteAddr)
	ip := net.ParseIP(request.Header.Get("X-Forwarded-For"))
	userAgent := request.Header.Get("User-Agent")

	err := unmarshal.DecodeJSONBody(request, &payload)

	if err != nil {
		handleError(err, writer)
		return
	}

	token, responseData, err := loginUser(payload.Email, payload.Password, ip, userAgent, handler.DB)

	if err != nil {
		handleError(err, writer)
		return
	}

	cookies := Cookies{Email: payload.Email, Token: token}

	cookies.Write(writer, handler.DB.getAuthDuration(), handler.SecureCookies)

	writer.WriteHeader(http.StatusOK)

	encoder := json.NewEncoder(writer)

	err = encoder.Encode(responseData)
}

func loginUser(email string, password string, ip net.IP, userAgent string, db UserDB) ([]byte, loginResponseData, error) {

	responseData := loginResponseData{}

	hash, err := db.getHashForEmail(email)

	if err != nil {
		return nil, responseData, err
	}

	err = bcrypt.CompareHashAndPassword(hash, []byte(password))

	if err != nil {
		return nil, responseData, &FailedRequest{
			Msg: "There was a problem logging in with this e-mail/password combination.",
		}
	}

	responseData.ValidEmailPasswordCombination = true

	token := make([]byte, 16)
	rand.Read(token)

	db.storeSessionToken(email, token, ip, userAgent)

	responseData.LoggedIn = true

	return token, responseData, nil
}
