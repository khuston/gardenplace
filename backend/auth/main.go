package main

import (
	"net/http"

	_ "github.com/go-sql-driver/mysql" // Load MySQL driver anonymously

	"github.com/khuston/gardenplace/auth"
	"github.com/khuston/gardenplace/config"
)

func main() {
	configuration := config.LoadConfiguration()

	db := auth.InitUserDBConnection(configuration.UserDBConnectionString)

	registrationHandler := auth.RegistrationHandler{DB: db}

	http.HandleFunc("/register", registrationHandler.HandleRegister)

	http.ListenAndServe(":9001", nil)
}
