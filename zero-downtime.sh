#!/bin/bash

echo "Starting zero-downtime deployment..."

# Build new images
docker-compose build --no-cache

# Scale up to 4 containers temporarily
echo "Scaling up containers..."
docker-compose up -d --scale dsatrek-1=2 --scale dsatrek-2=2

# Wait for new containers to be ready
sleep 20

# Now restart containers one by one
echo "Restarting containers with new images..."
docker-compose restart dsatrek-1
sleep 10
docker-compose restart dsatrek-2
sleep 10

# Scale back to normal
echo "Scaling back to normal..."
docker-compose up -d

# Restart nginx to ensure it picks up any changes
docker-compose restart nginx

# Clean up old images
docker image prune -f

echo "Deployment complete!"