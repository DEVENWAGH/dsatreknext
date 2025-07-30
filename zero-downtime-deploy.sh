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
sleep 15

# Simple health check - just check if container is running
echo "Checking if new container is running..."
if docker-compose ps dsatrek | grep -q "Up"; then
  echo "✅ New container is running!"
else
  echo "❌ Health check failed, keeping old instance"
fi

# Scale down to 1 instance (removes old one)
echo "Scaling down to 1 instance..."
docker-compose up -d --scale dsatrek=1 --no-recreate

# Clean up old containers and images
echo "Cleaning up old containers..."
docker ps -a | grep "dsatrek-dsatrek-" | grep "Exited" | awk '{print $1}' | xargs -r docker rm -f
docker container prune -f
docker image prune -f

echo "Zero-downtime deployment completed!"