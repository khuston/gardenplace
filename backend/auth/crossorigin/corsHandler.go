package crossorigin

import (
	"net/http"
	"net/url"
)

func CORSHandler(h http.Handler, allowedOrigins []*url.URL) http.HandlerFunc {

	allowOrigin := func(origin *url.URL) bool {
		for _, allowedOrigin := range allowedOrigins {
			if isSameOrigin(origin, allowedOrigin) {
				return true
			}
		}
		return false
	}

	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		originURL, _ := url.ParseRequestURI(origin)
		if allowOrigin(originURL) {

			header := w.Header()
			header.Add("Access-Control-Allow-Origin", origin)

			if r.Method == "OPTIONS" {
				// Handle preflight requests by returning expected headers to browser.
				// https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
				header.Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
				header.Add("Access-Control-Max-Age", "86400")
				header.Add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
				w.WriteHeader(http.StatusNoContent)
			} else {
				h.ServeHTTP(w, r)
			}
		}
	}
}

func isSameOrigin(origin1, origin2 *url.URL) bool {
	hostname1 := origin1.Hostname()
	hostname2 := origin2.Hostname()
	scheme1 := origin1.Scheme
	scheme2 := origin2.Scheme

	if (hostname1 == hostname2) && (scheme1 == scheme2) {
		return true
	}

	return false
}
