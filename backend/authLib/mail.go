package authLib

import (
	"fmt"
	"net/mail"
	"net/smtp"
	"time"
)

type Mailer interface {
	SendMail(to string, subject string, body string) error
}

type SMTPVerificationMailer struct {
	Endpoint string
	Username string
	Password string
	From     *mail.Address
	FromName string
}

func (mailer SMTPVerificationMailer) SendMail(to string, subject string, body string) error {

	msg := []byte("From: " + mailer.FromName + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"Date: " + time.Now().Format(time.RFC1123Z) + "\r\n" +
		"Mime-Version: 1.0;\r\n" +
		"Content-Type: text/html; charset=\"ISO-8859-1\";\r\n" +
		"Content-Transfer-Encoding: 7bit;\r\n" +
		"\r\n" + body)

	var auth smtp.Auth = nil

	if mailer.Password != "" {
		auth = smtp.PlainAuth("", mailer.Username, mailer.Password, mailer.Endpoint)
	}

	fmt.Println("Attempting to send mail via endpoint: " + mailer.Endpoint)

	err := smtp.SendMail(mailer.Endpoint+":25", auth, mailer.From.Address, []string{to}, msg)

	if err != nil {
		fmt.Println("Encountered error attempting to mail: ", err)
	} else {
		fmt.Println("Mailed without error.")
	}

	return err
}
