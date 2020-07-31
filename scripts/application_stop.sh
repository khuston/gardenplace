cd /webapps/gardenplace/backend/authService
kill $(cat auth_pidfile)

cd /webapps/gardenplace/backend/api
kill $(cat api_pidfile)