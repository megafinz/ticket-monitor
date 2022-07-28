#!/bin/bash
echo "------------ PUSH -------------"
docker tag ticket-monitor-migrator registry.heroku.com/$APP_NAME/release
docker tag ticket-monitor-api registry.heroku.com/$APP_NAME/web
docker tag ticket-monitor-worker registry.heroku.com/$APP_NAME/worker
docker push registry.heroku.com/$APP_NAME/release
docker push registry.heroku.com/$APP_NAME/web
docker push registry.heroku.com/$APP_NAME/worker

echo "----------- RELEASE -----------"
heroku container:release release web worker --app $APP_NAME
