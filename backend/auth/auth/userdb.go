package auth

import (
	"database/sql"
	"fmt"
	"net"
	"time"
)

type UserDB interface {
	storeEmailAndHash(email string, hash string) error
	getHashForEmail(email string) ([]byte, error)
	storeSessionToken(email string, token []byte, ip net.IP, userAgent string) error
	revokeSessionToken(email string, token []byte) error
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

func (db SQLUserDB) storeSessionToken(email string, token []byte, ip net.IP, userAgent string) error {

	ipAddress := ip.To4()
	ipField := "ipv4_address, "
	ipValue := "?, "

	if ipAddress == nil {
		ipAddress = ip.To16()
		ipField = "ipv6_address, "
	}

	if ipAddress == nil {
		ipField = ""
		ipValue = ""
	}

	statement, err := db.DB.Prepare("INSERT INTO sessions (session_token, user_id, " + ipField + "user_agent, expires)" +
		" SELECT ?, id, " + ipValue + "?, ADDTIME(CURRENT_TIMESTAMP(), ?)" +
		" FROM users WHERE email = ?")

	if err != nil {
		return err
	}

	if ipAddress != nil {
		_, err = statement.Exec(token, ipAddress, userAgent, db.getAuthDuration()/time.Second, email)
	} else {
		_, err = statement.Exec(token, userAgent, db.getAuthDuration()/time.Second, email)
	}

	return err
}

func (db SQLUserDB) revokeSessionToken(email string, token []byte) error {

	// Email is also required because there is no guarantee that session tokens are unique.
	// We don't want to log out other users.
	statement, err := db.DB.Prepare("DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = ?) AND session_token = ?")

	if err != nil {
		return err
	}

	_, err = statement.Exec(email, token)

	return err
}

func (db SQLUserDB) getAuthDuration() time.Duration {
	return db.authDuration // nanoseconds!
}
