package main

import (
	"net/http"
	"strconv"

	_ "github.com/go-sql-driver/mysql" // Load MySQL driver anonymously

	"github.com/khuston/gardenplace/auth"
	"github.com/khuston/gardenplace/config"
)

func main() {
	configuration := config.LoadConfiguration()

	db := auth.InitUserDBConnection(configuration.UserDBConnectionString)

	registrationHandler := auth.RegistrationHandler{DB: db}

	http.HandleFunc("/register", registrationHandler.HandleRegister)

	if configuration.UseTLS {
		http.ListenAndServeTLS(":"+strconv.FormatInt(configuration.Port, 10),
			"/etc/letsencrypt/live/gardenplace.showandtell.page/fullchain.pem",
			"/etc/letsencrypt/live/gardenplace.showandtell.page/privkey.pem", nil)
	} else {
		http.ListenAndServe(":"+strconv.FormatInt(configuration.Port, 10), nil)
	}
}
