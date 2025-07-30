#!/bin/bash

echo "Starting zero-downtime deployment..."

# Build new image
docker-compose build dsatrek

# Scale up to 2 instances
docker-compose up -d --scale dsatrek=2 --no-recreate

# Wait for new instance to be healthy
echo "Waiting for new instance to be healthy..."
sleep 45

# Remove old instance
docker-compose up -d --scale dsatrek=1 --remove-orphans

echo "Zero-downtime deployment completed!"