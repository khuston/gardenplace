package main

import (
	"fmt"
	"math/rand"
	"net/http"
	"net/mail"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql" // Load MySQL driver anonymously

	"github.com/khuston/gardenplace/authLib"
	"github.com/khuston/gardenplace/comms"
)

func main() {
	fmt.Println("[OK] authService started. Configuring dependencies...")

	rand.Seed(time.Now().UTC().UnixNano())

	configuration, err := LoadConfiguration()

	if err != nil {
		fmt.Println("[ERROR] Error while loading configuration: ", err)
		return
	}

	fmt.Println("[OK] Configuration loaded without error. Initializing database pool...")

	db, err := authLib.InitUserDBConnection(configuration.UserDBConnectionString)

	if err != nil {
		fmt.Println("[ERROR] Error while initializing database pool: ", err)
		return
	}

	fmt.Println("[OK] Database pool initialized without error. Initializing SMTP Verification Mailer...")

	smtpFrom, err := mail.ParseAddress(configuration.SMTPFrom)

	mailer := authLib.SMTPVerificationMailer{Endpoint: configuration.SMTPEndpoint, Username: configuration.SMTPUsername, Password: configuration.SMTPPassword,
		From: smtpFrom, FromName: configuration.SMTPFromName}

	if err != nil {
		fmt.Println("[ERROR] Error while initializing SMTP Verificatin Mailer: ", err)
		return
	}

	fmt.Println("[OK] SMTP Verification mailer initialized without error. Initializing handlers...")

	loginHandler := authLib.LoginHandler{DB: db, SecureCookies: configuration.UseTLS}

	logoutHandler := authLib.LogoutHandler{DB: db, SecureCookies: configuration.UseTLS}

	verifyHandler := authLib.VerifyHandler{DB: db}

	registrationHandler := authLib.RegistrationHandler{DB: db, SendMail: mailer.SendMail, VerifyEndpoint: configuration.VerifyEndpoint}

	serveLoginWithCORS := comms.CORSHandler(loginHandler, configuration.AllowedOriginURLs())

	serveLogoutWithCORS := comms.CORSHandler(logoutHandler, configuration.AllowedOriginURLs())

	serveRegistrationWithCORS := comms.CORSHandler(registrationHandler, configuration.AllowedOriginURLs())

	serveVerificationWithCORS := comms.CORSHandler(verifyHandler, configuration.AllowedOriginURLs())

	fmt.Println("[OK] Handlers initialized. Starting server...")

	http.HandleFunc("/register", serveRegistrationWithCORS)

	http.HandleFunc("/login", serveLoginWithCORS)

	http.HandleFunc("/logout", serveLogoutWithCORS)

	http.HandleFunc("/verify", serveVerificationWithCORS)

	reportStatusAfterInitialize(configuration)

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

	logMessage := "[OK] Will listen on port " + port

	if configuration.UseTLS {
		logMessage = logMessage + " with TLS"
	} else {
		logMessage = logMessage + " without TLS"
	}

	fmt.Println(logMessage)
}
