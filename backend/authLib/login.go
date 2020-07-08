package authLib

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"net"
	"net/http"

	"github.com/khuston/gardenplace/comms"
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

	err := comms.DecodeJSONBody(request, &payload)

	if err != nil {
		handleError(err, writer)
		return
	}

	cookies, err := comms.LoadCookies(request, handler.SecureCookies)

	var responseData loginResponseData

	if payload.GetNonce {
		var nonce int

		nonce, err = handler.DB.getUserNonce(payload.Email)

		cookies.Nonce = nonce

		responseData = loginResponseData{}

	} else {
		var token []byte

		token, responseData, err = loginUser(payload.Email, payload.Password, ip, userAgent, handler.DB, cookies.Nonce)

		cookies = &comms.Cookies{Email: payload.Email, Token: token}
	}

	if err != nil {
		handleError(err, writer)
		return
	}

	cookies.Write(writer, handler.DB.getAuthDuration(), handler.SecureCookies)

	writer.WriteHeader(http.StatusOK)

	encoder := json.NewEncoder(writer)

	err = encoder.Encode(responseData)
}

func loginUser(email string, password string, ip net.IP, userAgent string, db UserDB, nonce int) ([]byte, loginResponseData, error) {

	responseData := loginResponseData{}

	err := db.checkAndIncrementUserNonce(email, nonce)

	if err != nil {
		return nil, responseData, err
	}

	hash, err := db.getHashForEmail(email)

	if err != nil {
		return nil, responseData, err
	}

	err = bcrypt.CompareHashAndPassword(hash, []byte(password))

	if err != nil {
		return nil, responseData, &InvalidLogin{}
	}

	responseData.ValidEmailPasswordCombination = true

	token := make([]byte, 16)
	rand.Read(token)

	err = db.storeSessionToken(email, token, ip, userAgent)

	if err != nil {
		return nil, responseData, err
	}

	responseData.LoggedIn = true

	return token, responseData, nil
}
