#!/bin/bash

# Pull latest code
git pull origin main

# Zero-downtime deployment
./zero-downtime-deploy.sh