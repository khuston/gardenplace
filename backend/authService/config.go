package main

import (
	"encoding/json"
	"fmt"
	"net/url"
	"os"
)

type Configuration struct {
	UserDBConnectionString string
	UseTLS                 bool
	Port                   int64
	AllowedOrigins         []string
	SMTPEndpoint           string
	SMTPUsername           string
	SMTPPassword           string
	SMTPFrom               string
	SMTPFromName           string
	VerifyEndpoint         string
}

func LoadConfiguration() (Configuration, error) {
	file, err := findConfigurationFile()

	defer file.Close()

	configuration := Configuration{}

	if err != nil {
		fmt.Println("Error loading configuration: ", err)
		return configuration, err
	}

	decoder := json.NewDecoder(file)

	decodeErr := decoder.Decode(&configuration)

	if decodeErr != nil {
		fmt.Println("Error loading configuration: ", decodeErr)
		return configuration, decodeErr
	}

	return configuration, nil
}

func findConfigurationFile() (*os.File, error) {

	file, err := os.Open("/etc/gardenplace/backend/authService/config.json")

	if err != nil {
		file, err = os.Open("config.json")
	}

	return file, err
}

func (config Configuration) AllowedOriginURLs() []*url.URL {
	var urls []*url.URL
	n := len(config.AllowedOrigins)
	urls = make([]*url.URL, n, n)

	for i, origin := range config.AllowedOrigins {
		urls[i], _ = url.Parse(origin)
	}

	return urls
}
