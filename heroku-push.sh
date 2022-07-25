#!/bin/bash
heroku container:push ticket-monitor -a $APP_NAME
heroku container:release ticket-monitor -a $APP_NAME
