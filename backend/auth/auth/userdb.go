package auth

import (
	"database/sql"
	"fmt"
)

type UserDB interface {
	storeEmailAndHash(email string, hash string) error
}

type SQLUserDB struct {
	DB *sql.DB
}

func InitUserDBConnection(connectionStr string) UserDB {
	db, err := sql.Open("mysql", connectionStr)

	if err != nil {
		fmt.Println("Critical error: ", err)
	}

	userDB := SQLUserDB{DB: db}

	return userDB
}

func (db SQLUserDB) storeEmailAndHash(email string, hash string) error {

	if db.emailIsUsed(email) {
		return &FailedRequest{Msg: "The e-mail address provided is already in use."}
	} else {
		// Prepared statement prevents SQL injection
		statement, err := db.DB.Prepare("INSERT INTO users (email, hash) VALUES (?, ?)")

		_, err = statement.Exec(email, hash)

		if err != nil {
			fmt.Println("Error: ", err)
			return &FailedRequest{Msg: err.Error()}
		}
	}

	return nil
}

func (db SQLUserDB) emailIsUsed(email string) bool {
	// Prepared statement prevents SQL injection
	statement, _ := db.DB.Prepare("SELECT email from users WHERE email = ?")

	var matchedEmail string

	err := statement.QueryRow(email).Scan(&matchedEmail)

	return (err == nil)
}
