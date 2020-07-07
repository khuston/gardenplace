package comms

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
)

func DecodeJSONBody(request *http.Request, payload interface{}) error {

	// 1. Create and configure decoder which can unmarshal JSON in HTTP request body to payload struct.
	decoder, err := makeJSONDecoder(request)

	if err == nil {
		// 2. Unmarshal JSON into payload struct.
		err = decoder.Decode(&payload)

		err = makeReadableError(err)

		err = enforceSingleJSONObjectRequest(decoder, err)
	}

	return err
}

func makeJSONDecoder(request *http.Request) (*json.Decoder, error) {
	err := error(nil)

	contentType := request.Header.Get("Content-Type")
	if contentType != "" {
		if strings.Split(strings.ToLower(contentType), ";")[0] != "application/json" {
			msg := "Content-Type header is not application/json"
			err = &MalformedRequest{Status: http.StatusUnsupportedMediaType, Msg: msg}
		}
	}

	request.Body = http.MaxBytesReader(nil, request.Body, 1048576)

	decoder := json.NewDecoder(request.Body)

	//decoder.DisallowUnknownFields()

	return decoder, err
}

func makeReadableError(err error) error {

	if err != nil {
		var syntaxError *json.SyntaxError
		var unmarshalTypeError *json.UnmarshalTypeError

		switch {
		case errors.As(err, &syntaxError):
			msg := fmt.Sprintf("Request body contains badly-formed JSON (at position %d)", syntaxError.Offset)
			return &MalformedRequest{Status: http.StatusBadRequest, Msg: msg}

		case errors.Is(err, io.ErrUnexpectedEOF):
			msg := fmt.Sprintf("Request body contains badly-formed JSON")
			return &MalformedRequest{Status: http.StatusBadRequest, Msg: msg}

		case errors.As(err, &unmarshalTypeError):
			msg := fmt.Sprintf("Request body contains an invalid value for the %q field (at position %d)", unmarshalTypeError.Field, unmarshalTypeError.Offset)
			return &MalformedRequest{Status: http.StatusBadRequest, Msg: msg}

		case strings.HasPrefix(err.Error(), "json: unknown field "):
			fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
			msg := fmt.Sprintf("Request body contains unknown field %s", fieldName)
			return &MalformedRequest{Status: http.StatusBadRequest, Msg: msg}

		case errors.Is(err, io.EOF):
			msg := "Request body must not be empty"
			return &MalformedRequest{Status: http.StatusBadRequest, Msg: msg}

		case err.Error() == "http: request body too large":
			msg := "Request body must not be larger than 1MB"
			return &MalformedRequest{Status: http.StatusRequestEntityTooLarge, Msg: msg}

		default:
			return err
		}
	}

	return nil
}

func enforceSingleJSONObjectRequest(decoder *json.Decoder, err error) error {
	if err == nil {
		err = decoder.Decode(&struct{}{})
		if err != io.EOF {
			msg := "Request body must only contain a single JSON object"
			return &MalformedRequest{Status: http.StatusBadRequest, Msg: msg}
		}

		return nil
	}

	return err
}
