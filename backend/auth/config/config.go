package config

import (
	"encoding/json"
	"os"
)

type Configuration struct {
	UserDBConnectionString string
}

func LoadConfiguration() Configuration {
	file, _ := os.Open("config.json")

	defer file.Close()

	decoder := json.NewDecoder(file)

	configuration := Configuration{}

	decoder.Decode(&configuration)

	return configuration
}
