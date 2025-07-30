#!/bin/bash

echo "Starting deployment..."

# Stop and remove old containers
echo "Stopping old containers..."
docker-compose down

# Clean up old containers
echo "Cleaning up..."
docker ps -a | grep "dsatrek" | awk '{print $1}' | xargs -r docker rm -f
docker container prune -f
docker image prune -f

# Build and start new containers
echo "Building and starting new containers..."
docker-compose up -d --build

echo "Deployment completed!"