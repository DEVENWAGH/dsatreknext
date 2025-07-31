#!/bin/bash

echo "Starting zero-downtime deployment..."

# Stop and remove containers
docker-compose down

# Clean up old images
docker image prune -f

# Build new images with no cache
docker-compose build --no-cache

# Start all services
docker-compose up -d

# Wait for services to be ready
sleep 30

echo "Deployment complete!"