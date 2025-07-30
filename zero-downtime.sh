#!/bin/bash

echo "Zero-downtime deployment starting..."

# Build new image
docker-compose build dsatrek

# Scale up to 2 instances
docker-compose up -d --scale dsatrek=2 --no-recreate

# Wait for new instance
echo "Waiting for new instance to be healthy..."
sleep 45

# Test if deployment is healthy
if curl -f https://dsatrek.com/api/health > /dev/null 2>&1; then
    echo "New instance is healthy, scaling down..."
    
    # Scale back to 1 instance (removes old one)
    docker-compose up -d --scale dsatrek=1 --remove-orphans
    
    echo "✅ Zero-downtime deployment completed!"
else
    echo "❌ Health check failed, keeping old instance"
    docker-compose up -d --scale dsatrek=1 --remove-orphans
    exit 1
fi