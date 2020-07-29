package main

import (
	"net/http"

	"github.com/johannesboyne/gofakes3"
	"github.com/johannesboyne/gofakes3/backend/s3mem"
)

func main() {
	backend := s3mem.New()
	faker := gofakes3.New(backend)
	handler := faker.Server()

	http.HandleFunc("/", handler.ServeHTTP)

	http.ListenAndServe(":4000", nil)
}
