#!/bin/bash

echo "Starting zero-downtime deployment..."

# Clean up old images
docker image prune -f

# Build new images with no cache
docker-compose build --no-cache

# Rolling update - one container at a time
for service in dsatrek-1 dsatrek-2; do
    echo "Updating $service..."
    docker-compose up -d --no-deps $service
    sleep 15
done

# Reload nginx config without restart
docker-compose exec nginx nginx -s reload

echo "Deployment complete!"