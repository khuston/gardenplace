package auth

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/url"
	"time"

	"github.com/khuston/gardenplace/unmarshal"
	"golang.org/x/crypto/bcrypt"
)

type LoginHandler struct {
	DB UserDB
}

type loginResponseData struct {
	ValidEmailPasswordCombination bool
	LoggedIn                      bool
	RequireTwoFactor              bool
	AuthToken                     string
}

// ServeHTTP fulfills an incoming login request if valid.
func (handler LoginHandler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	payload := LoginPayload{}

	err := unmarshal.DecodeJSONBody(request, &payload)

	if err != nil {
		handleError(err, writer)
		return
	}

	responseData, err := loginUser(payload.Email, payload.Password, handler.DB)

	if err != nil {
		handleError(err, writer)
		return
	}

	originURL, _ := url.ParseRequestURI(request.Header.Get("Origin"))
	originHostname := originURL.Hostname()

	addCookie(writer, "__Secure-Email", payload.Email,
		handler.DB.getAuthDuration(), originHostname)

	addCookie(writer, "__Secure-Token", responseData.AuthToken,
		handler.DB.getAuthDuration(), originHostname)

	writer.WriteHeader(http.StatusOK)

	encoder := json.NewEncoder(writer)

	err = encoder.Encode(responseData)
}

func loginUser(email string, password string, db UserDB) (loginResponseData, error) {

	responseData := loginResponseData{}

	hash, err := db.getHashForEmail(email)

	if err != nil {
		return responseData, err
	}

	err = bcrypt.CompareHashAndPassword(hash, []byte(password))

	if err == nil {
		responseData.ValidEmailPasswordCombination = true

		token := make([]byte, 16)
		rand.Read(token)

		db.storeAuthToken(email, token)

		responseData.AuthToken = hex.EncodeToString(token)
		responseData.LoggedIn = true
	}

	if !responseData.ValidEmailPasswordCombination {
		return responseData, &FailedRequest{
			Msg: "There was a problem logging in with this e-mail/password combination.",
		}
	}

	return responseData, nil
}

func addCookie(writer http.ResponseWriter, name string, value string, duration time.Duration, domain string) {
	cookie := http.Cookie{
		Name:    name,
		Value:   value,
		Expires: time.Now().Add(duration),
		Secure:  true,
		Path:    "/",
		Domain:  domain,
	}
	http.SetCookie(writer, &cookie)
}
