package authLib

import (
	"net/mail"
	"net/smtp"
)

type Mailer interface {
	SendMail(to string, body []byte) error
}

type SMTPVerificationMailer struct {
	Endpoint string
	Username string
	Password string
	From     *mail.Address
}

func (mailer SMTPVerificationMailer) SendMail(to string, body []byte) error {

	msg := []byte("To: " + to + "\r\n" +
		"Subject: Gardenplace E-mail Verification\r\n" +
		"\r\n" +
		"This is the email body.\r\n")

	var auth smtp.Auth = nil

	if mailer.Password != "" {
		auth = smtp.PlainAuth("", mailer.Username, mailer.Password, mailer.Endpoint)
	}

	err := smtp.SendMail(mailer.Endpoint+":25", auth, mailer.From.Address, []string{to}, msg)

	return err
}
