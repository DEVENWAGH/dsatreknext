#!/bin/bash

echo "Stopping services..."
docker-compose down

echo "Rebuilding and starting services..."
docker-compose up -d --build

echo "Waiting for services to be healthy..."
sleep 30

echo "Checking service status..."
docker-compose ps

echo "Checking logs..."
docker-compose logs --tail=20 dsatrek

echo "Services restarted successfully!"