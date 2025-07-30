#!/bin/bash

echo "Starting zero-downtime deployment..."

# Build new image
echo "Building new image..."
docker-compose build

# Scale up with new container
echo "Starting new container..."
docker-compose up -d --scale dsatrek=2 --no-recreate

# Wait for new container
echo "Waiting for new container..."
sleep 20

# Scale down to remove old container
echo "Removing old container..."
docker-compose up -d --scale dsatrek=1

# Clean up
echo "Cleaning up..."
docker image prune -f

echo "Zero-downtime deployment completed!"