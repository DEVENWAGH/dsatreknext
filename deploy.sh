#!/bin/bash

# DSATrek Deployment Script
set -e

echo "🚀 Starting DSATrek deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build new images
echo "🔨 Building new Docker images..."
docker-compose build --no-cache

# Start containers
echo "▶️ Starting containers..."
docker-compose up -d

# Wait for health check
echo "🏥 Waiting for health check..."
sleep 30

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 DSATrek is running at https://dsatrek.com"
else
    echo "❌ Deployment failed!"
    docker-compose logs
    exit 1
fi

# Clean up unused images
echo "🧹 Cleaning up..."
docker system prune -f

echo "🎉 Deployment completed successfully!"