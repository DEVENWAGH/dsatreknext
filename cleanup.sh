#!/bin/bash

# Stop and remove old containers
docker-compose down --remove-orphans

# Remove old dsatrek containers
docker ps -a | grep "dsatrek-dsatrek-" | awk '{print $1}' | xargs -r docker rm -f

# Remove dangling images
docker image prune -f

# Remove unused containers
docker container prune -f

echo "Cleanup completed"