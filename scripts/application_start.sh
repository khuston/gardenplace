nohup backend/auth/gardenplace & echo $! > pidfile & disown $(cat pidfile)