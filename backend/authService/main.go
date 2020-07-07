package main

import (
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql" // Load MySQL driver anonymously

	"github.com/khuston/gardenplace/authLib"
	"github.com/khuston/gardenplace/comms"
)

func main() {
	// 1. Configure Dependencies
	rand.Seed(time.Now().UTC().UnixNano())

	configuration, err := LoadConfiguration()

	if err != nil {
		return
	}

	db := authLib.InitUserDBConnection(configuration.UserDBConnectionString)

	loginHandler := authLib.LoginHandler{DB: db, SecureCookies: configuration.UseTLS}

	logoutHandler := authLib.LogoutHandler{DB: db, SecureCookies: configuration.UseTLS}

	// TODO:     verifyHandler := auth.VerifyHandler{DB: db}

	registrationHandler := authLib.RegistrationHandler{DB: db}

	serveLoginWithCORS := comms.CORSHandler(loginHandler, configuration.AllowedOriginURLs())

	serveLogoutWithCORS := comms.CORSHandler(logoutHandler, configuration.AllowedOriginURLs())

	serveRegistrationWithCORS := comms.CORSHandler(registrationHandler, configuration.AllowedOriginURLs())

	http.HandleFunc("/register", serveRegistrationWithCORS)

	http.HandleFunc("/login", serveLoginWithCORS)

	http.HandleFunc("/logout", serveLogoutWithCORS)

	// TODO:   http.HandleFunc("/verify/", verifyHandler)

	// 2. Write Status
	reportStatusAfterInitialize(configuration)

	// 3. Start Server
	port := strconv.FormatInt(configuration.Port, 10)

	if configuration.UseTLS {
		err = http.ListenAndServeTLS(":"+port,
			"/etc/letsencrypt/live/gardenplace.showandtell.page/fullchain.pem",
			"/etc/letsencrypt/live/gardenplace.showandtell.page/privkey.pem", nil)
	} else {
		err = http.ListenAndServe(":"+port, nil)
	}

	if err != nil {
		fmt.Println(err)
	}
}

func reportStatusAfterInitialize(configuration Configuration) {
	port := strconv.FormatInt(configuration.Port, 10)

	logMessage := "Will listen on port " + port

	if configuration.UseTLS {
		logMessage = logMessage + " with TLS"
	} else {
		logMessage = logMessage + " without TLS"
	}

	fmt.Println(logMessage)
}
