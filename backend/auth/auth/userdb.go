package auth

import (
	"database/sql"
	"fmt"
	"time"
)

type UserDB interface {
	storeEmailAndHash(email string, hash string) error
	getHashForEmail(email string) ([]byte, error)
	storeAuthToken(email string, token []byte) error
	getAuthDuration() time.Duration
}

type SQLUserDB struct {
	DB           *sql.DB
	authDuration time.Duration
}

func InitUserDBConnection(connectionStr string) UserDB {
	db, err := sql.Open("mysql", connectionStr)

	if err != nil {
		fmt.Println("Critical error: ", err)
	}

	userDB := SQLUserDB{DB: db, authDuration: time.Hour * 1.0}

	return userDB
}

func (db SQLUserDB) storeEmailAndHash(email string, hash string) error {

	if db.emailIsUsed(email) {
		return &FailedRequest{Msg: "The e-mail address provided is already in use."}
	}

	// Prepared statement prevents SQL injection
	statement, err := db.DB.Prepare("INSERT INTO users (email, hash) VALUES (?, ?)")

	_, err = statement.Exec(email, hash)

	if err != nil {
		fmt.Println("Error: ", err)
		return &FailedRequest{Msg: err.Error()}
	}

	return nil
}

func (db SQLUserDB) emailIsUsed(email string) bool {
	statement, _ := db.DB.Prepare("SELECT email from users WHERE email = ?")

	var matchedEmail string

	err := statement.QueryRow(email).Scan(&matchedEmail)

	return (err == nil)
}

func (db SQLUserDB) getHashForEmail(email string) ([]byte, error) {
	statement, _ := db.DB.Prepare("SELECT hash from users WHERE email = ?")

	var hash []byte

	err := statement.QueryRow(email).Scan(&hash)

	return hash, err
}

func (db SQLUserDB) storeAuthToken(email string, token []byte) error {
	statement, _ := db.DB.Prepare("UPDATE users SET auth_token = ?, auth_token_expires = ADDTIME(CURRENT_TIMESTAMP(), ?) WHERE email = ?")

	_, err := statement.Exec(token, db.authDuration, email)

	return err
}

func (db SQLUserDB) getAuthDuration() time.Duration {
	return db.authDuration
}
