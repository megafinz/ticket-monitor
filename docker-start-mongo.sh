#!/bin/bash
docker-compose --env-file .docker.env down && docker-compose --env-file .docker.env up mongo --remove-orphans
