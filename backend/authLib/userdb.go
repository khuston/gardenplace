package authLib

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"math"
	"net"
	"time"
)

type UserDB interface {
	storeEmailAndHash(email string, hash string) error
	getHashForEmail(email string) ([]byte, error)
	storeSessionToken(email string, token []byte, ip net.IP, userAgent string) error
	revokeSessionToken(email string, token []byte) error
	getSessionDuration() time.Duration
	getEmailVerifyDuration() time.Duration
	getUserNonce(email string) (int, error)
	checkAndIncrementUserNonce(email string, nonce int) error
	createEmailVerificationCode(email string) (string, error)
	verifyEmail(code string) error
	isEmailVerified(email string) (bool, error)
}

type SQLUserDB struct {
	DB                  *sql.DB
	sessionDuration     int
	emailVerifyDuration int
}

func InitUserDBConnection(connectionStr string) (UserDB, error) {
	db, err := sql.Open("mysql", connectionStr)

	if err != nil {
		fmt.Println("Critical error: ", err)
	}

	userDB := SQLUserDB{DB: db, sessionDuration: 3600, emailVerifyDuration: 3600 * 24 * 7}

	return userDB, err
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
		_, err = statement.Exec(token, ipAddress, userAgent, db.sessionDuration, email)
	} else {
		_, err = statement.Exec(token, userAgent, db.sessionDuration, email)
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

func (db SQLUserDB) getSessionDuration() time.Duration {
	return time.Duration(db.sessionDuration) * time.Second // time.Duration is in nanoseconds!
}

func (db SQLUserDB) getEmailVerifyDuration() time.Duration {
	return time.Duration(db.emailVerifyDuration) * time.Second // time.Duration is in nanoseconds!
}

func (db SQLUserDB) getUserNonce(email string) (int, error) {
	statement, err := db.DB.Prepare("SELECT nonce FROM users WHERE email = ?")

	var nonce int = -1

	err = statement.QueryRow(email).Scan(&nonce)

	if err != nil {
		return nonce, &InvalidLogin{}
	}

	return nonce, err
}

func (db SQLUserDB) checkAndIncrementUserNonce(email string, nonce int) error {
	// 1. Check Nonce
	statement, err := db.DB.Prepare("SELECT nonce FROM users WHERE email = ?")

	var nonceInDB int

	err = statement.QueryRow(email).Scan(&nonceInDB)

	if err != nil {
		return err
	}

	if nonce != nonceInDB {
		return &NonceError{}
	}

	// 2. Increment Nonce
	if nonce >= math.MaxInt32 {
		nonce = 0
	} else {
		nonce = nonce + 1
	}

	statement, err = db.DB.Prepare("UPDATE users SET nonce = ? WHERE email = ?")

	_, err = statement.Exec(nonce, email)

	return nil
}

func (db SQLUserDB) isEmailVerified(email string) (bool, error) {
	isVerified := false

	statement, err := db.DB.Prepare("SELECT email_verified = b'1' FROM users WHERE email = ?")

	if err != nil {
		return isVerified, err
	}

	err = statement.QueryRow(email).Scan(&isVerified)

	return isVerified, err
}

func (db SQLUserDB) verifyEmail(code string) error {
	// 1. Find code if it exists
	// Don't bother checking expiration. In this case, expiration need not be timely. Rather, it is for eventual cleanup.
	statement, err := db.DB.Prepare("SELECT user_id FROM email_verifications WHERE code = ?")

	var userID int64

	byteCode, err := hex.DecodeString(code)

	if err != nil {
		return err
	}

	err = statement.QueryRow(byteCode).Scan(&userID)

	if err != nil {
		return err
	}

	// 2. Set user to verified and remove code record.
	statement, err = db.DB.Prepare("UPDATE users SET email_verified = TRUE WHERE id = ?")

	_, err = statement.Exec(userID)

	if err != nil {
		return err
	}

	statement, err = db.DB.Prepare("DELETE FROM email_verifications WHERE code = ?")

	_, err = statement.Exec(byteCode)

	return nil
}

func (db SQLUserDB) createEmailVerificationCode(email string) (string, error) {
	code := make([]byte, 4)
	rand.Read(code)

	statement, err := db.DB.Prepare("INSERT INTO email_verifications (code, expires, user_id)" +
		" SELECT ?, ADDTIME(CURRENT_TIMESTAMP(), ?), id" +
		" FROM users WHERE email = ?")

	if err != nil {
		return "", err
	}

	result, err := statement.Exec(code, db.emailVerifyDuration, email)

	if err != nil {
		return "", err
	}

	rowsAffected, err := result.RowsAffected()

	if err == nil && rowsAffected != 1 {
		err = fmt.Errorf("Should have created 1 e-mail verification code, but instead created ", rowsAffected)
	}

	return hex.EncodeToString(code), err
}
