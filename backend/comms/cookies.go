package comms

import (
	"encoding/hex"
	"net/http"
	"strconv"
	"time"
)

type Cookies struct {
	Email string
	Token []byte
	Nonce int
}

func LoadCookies(request *http.Request, secureCookies bool) (*Cookies, error) {
	cookies := Cookies{}

	err := cookies.loadFromRequest(request, secureCookies)

	return &cookies, err
}

func (cookies *Cookies) loadFromRequest(request *http.Request, secureCookies bool) error {

	cookiePrefix := getCookiePrefix(secureCookies)

	cookieMap := getCookieMap(request)

	cookies.Email = cookieMap[cookiePrefix+"Email"]
	token, err := hex.DecodeString(cookieMap[cookiePrefix+"Token"])
	cookies.Token = token
	nonce, err := strconv.Atoi(cookieMap[cookiePrefix+"Nonce"])
	cookies.Nonce = nonce

	return err
}

func (cookies *Cookies) Write(writer http.ResponseWriter, duration time.Duration, secureCookies bool) {
	cookiePrefix := getCookiePrefix(secureCookies)

	addCookie(writer, cookiePrefix+"Email", cookies.Email, duration, secureCookies)

	if cookies.Token != nil {
		addCookie(writer, cookiePrefix+"Token", hex.EncodeToString(cookies.Token), duration, secureCookies)
	} else {
		addCookie(writer, cookiePrefix+"Token", "", duration, secureCookies)
	}

	addCookie(writer, cookiePrefix+"Nonce", strconv.Itoa(cookies.Nonce), duration, secureCookies)

}

func getCookiePrefix(secureCookies bool) string {
	cookiePrefix := ""

	if secureCookies {
		cookiePrefix = "__Secure-"
	}

	return cookiePrefix
}

func addCookie(writer http.ResponseWriter, name string, value string, duration time.Duration, secureCookies bool) {
	cookie := http.Cookie{
		Name:     name,
		Value:    value,
		Expires:  time.Now().Add(duration),
		Secure:   secureCookies,
		Path:     "/",
		HttpOnly: true,
	}
	http.SetCookie(writer, &cookie)
}

func getCookieMap(request *http.Request) map[string]string {

	cookieMap := make(map[string]string)

	for _, cookie := range request.Cookies() {
		cookieMap[cookie.Name] = cookie.Value
	}

	return cookieMap
}
