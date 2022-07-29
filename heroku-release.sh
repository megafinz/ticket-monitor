#!/usr/bin/env bash
declare -A appsToProcesses
appsToProcesses[migrator]=release
appsToProcesses[api]=web
appsToProcesses[worker]=worker

if [[ -z $HEROKU_APP_NAME ]]; then
    echo "HEROKU_APP_NAME env var must be set"
    exit 1
fi

echo "----------- BUILD -------------"
for app in "${!appsToProcesses[@]}"; do
    docker build -t ticket-monitor-$app -f Dockerfile.$app .
done

echo "------------ PUSH -------------"
for app in "${!appsToProcesses[@]}"; do
    docker tag ticket-monitor-$app registry.heroku.com/$HEROKU_APP_NAME/${appsToProcesses[$app]}
done
for release in "${appsToProcesses[@]}"; do
    docker push registry.heroku.com/$HEROKU_APP_NAME/$release
done

echo "----------- RELEASE -----------"
heroku container:release "${appsToProcesses[@]}" --app $HEROKU_APP_NAME
