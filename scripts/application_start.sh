cd /webapps/gardenplace/backend/authService
nohup ./authService > authService.out 2> authService.err </dev/null & echo $! > auth_pidfile