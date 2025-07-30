#!/bin/bash

echo "Simple deployment with minimal downtime..."

# Stop only the app, keep nginx running
docker-compose stop dsatrek

# Rebuild and start app
docker-compose up -d --build dsatrek

# Wait for app to be ready
sleep 20

echo "Deployment completed!"