package main

import (
	"fmt"
	"net/http"
	"strconv"

	_ "github.com/go-sql-driver/mysql" // Load MySQL driver anonymously

	"github.com/khuston/gardenplace/auth"
	"github.com/khuston/gardenplace/config"
	"github.com/khuston/gardenplace/crossorigin"
)

func main() {
	// 1. Configure Dependencies
	configuration := config.LoadConfiguration()

	db := auth.InitUserDBConnection(configuration.UserDBConnectionString)

	registrationHandler := auth.RegistrationHandler{DB: db}

	serveRegistrationWithCORS := crossorigin.CORSHandler(registrationHandler, configuration.AllowedOriginURLs())

	http.HandleFunc("/register", serveRegistrationWithCORS)

	// 2. Write Status
	reportStatusAfterInitialize(configuration)

	// 3. Start Server
	var err error

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
