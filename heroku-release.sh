#!/bin/bash
heroku container:push migrator api worker --recursive -a $APP_NAME
heroku container:release migrator api worker -a $APP_NAME
