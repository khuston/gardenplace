package main

import (
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql" // Load MySQL driver anonymously

	"github.com/khuston/gardenplace/auth"
	"github.com/khuston/gardenplace/config"
	"github.com/khuston/gardenplace/crossorigin"
)

func main() {
	// 1. Configure Dependencies
	rand.Seed(time.Now().UTC().UnixNano())

	configuration, err := config.LoadConfiguration()

	if err != nil {
		return
	}

	db := auth.InitUserDBConnection(configuration.UserDBConnectionString)

	loginHandler := auth.LoginHandler{DB: db, SecureCookies: configuration.UseTLS}

	// TODO:     verifyHandler := auth.VerifyHandler{DB: db}

	registrationHandler := auth.RegistrationHandler{DB: db}

	serverLoginWithCORS := crossorigin.CORSHandler(loginHandler, configuration.AllowedOriginURLs())

	serveRegistrationWithCORS := crossorigin.CORSHandler(registrationHandler, configuration.AllowedOriginURLs())

	http.HandleFunc("/register", serveRegistrationWithCORS)

	http.HandleFunc("/login", serverLoginWithCORS)

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

func reportStatusAfterInitialize(configuration config.Configuration) {
	port := strconv.FormatInt(configuration.Port, 10)

	logMessage := "Will listen on port " + port

	if configuration.UseTLS {
		logMessage = logMessage + " with TLS"
	} else {
		logMessage = logMessage + " without TLS"
	}

	fmt.Println(logMessage)
}
