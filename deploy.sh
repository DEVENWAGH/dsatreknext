#!/bin/bash

# Pull latest code
git pull origin main

# Zero-downtime deployment
./zero-downtime-deploy.sh

# Verify deployment
curl -f https://dsatrek.com/api/health || echo "Health check failed"