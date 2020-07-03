package config

import (
	"encoding/json"
	"os"
)

type Configuration struct {
	UserDBConnectionString string
	UseTLS                 bool
	Port                   int64
}

func LoadConfiguration() Configuration {
	file, _ := os.Open("config.json")

	defer file.Close()

	decoder := json.NewDecoder(file)

	configuration := Configuration{}

	decoder.Decode(&configuration)

	return configuration
}
