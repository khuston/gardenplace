package config

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
	SecureCookies          bool
}

func LoadConfiguration() Configuration {
	file, err := findConfigurationFile()

	defer file.Close()

	configuration := Configuration{}

	if err == nil {
		decoder := json.NewDecoder(file)

		decodeErr := decoder.Decode(&configuration)

		if decodeErr != nil {
			fmt.Println(decodeErr)
		}
	} else {
		fmt.Println(err)
	}

	return configuration
}

func findConfigurationFile() (*os.File, error) {

	file, err := os.Open("/etc/gardenplace/backend/auth/config.json")

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
