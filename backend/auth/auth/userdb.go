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
	// Prepared statement prevents SQL injection
	statement, err := db.DB.Prepare("INSERT INTO users (email, hash) VALUES (?, ?)")

	// We do not query whether email already exists in the users database, because it should
	// require unique email addresses, returning an error when we execute this statement.
	_, err = statement.Exec(email, hash)

	if err != nil {
		fmt.Println("Error: ", err)
	}

	return nil
}
