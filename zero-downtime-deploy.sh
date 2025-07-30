#!/bin/bash

echo "Starting zero-downtime deployment..."

# Build new image
echo "Building new image..."
docker-compose build dsatrek

# Scale up to 2 instances
echo "Scaling up to 2 instances..."
docker-compose up -d --scale dsatrek=2 --no-recreate

# Wait for new instance to be ready
echo "Waiting for new instance to be ready..."
sleep 30

# Scale down to 1 instance (removes old one)
echo "Scaling down to 1 instance..."
docker-compose up -d --scale dsatrek=1 --no-recreate

# Clean up unused containers and images
echo "Cleaning up..."
docker container prune -f
docker image prune -f

echo "Zero-downtime deployment completed!"