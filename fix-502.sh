#!/bin/bash

echo "Checking container status..."
docker ps -a | grep dsatrek

echo "Checking container logs..."
docker logs dsatrek-dsatrek-8 --tail 20

echo "Testing health endpoint..."
docker exec dsatrek-dsatrek-8 wget -qO- http://localhost:3000/api/health || echo "Health check failed"

echo "Restarting nginx..."
docker restart dsatrek-nginx

echo "Done!"