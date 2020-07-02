cd /webapps/gardenplace/backend/auth
nohup gardenplace & echo $! > pidfile & disown $(cat pidfile)