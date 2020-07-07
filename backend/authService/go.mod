module github.com/khuston/gardenplace/authService

go 1.14

require (
	github.com/go-sql-driver/mysql v1.5.0
	github.com/pquerna/otp v1.2.0
	golang.org/x/crypto v0.0.0-20200622213623-75b288015ac9

	github.com/khuston/gardenplace/authLib v0.0.0
	github.com/khuston/gardenplace/comms v0.0.0
)

replace (
	github.com/khuston/gardenplace/authLib v0.0.0 => ../authLib
	github.com/khuston/gardenplace/comms v0.0.0 => ../comms
)