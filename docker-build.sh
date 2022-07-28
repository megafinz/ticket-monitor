#!/bin/bash
docker build -t ticket-monitor-migrator -f Dockerfile.migrator .
docker build -t ticket-monitor-api -f Dockerfile.api .
docker build -t ticket-monitor-worker -f Dockerfile.worker .
