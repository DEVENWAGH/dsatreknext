#!/bin/bash

# Pull latest code
git pull origin main

# Zero-downtime deployment
chmod +x zero-downtime-deploy.sh
./zero-downtime.sh