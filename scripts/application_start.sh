cd /webapps/gardenplace/backend/authService
nohup ./authService > authService.out 2> authService.err </dev/null & echo $! > auth_pidfile

cd /webapps/gardenplace/backend/api
yarn install
nohup yarn start > api.out 2> api.err </dev/null & echo $! > api_pidfile