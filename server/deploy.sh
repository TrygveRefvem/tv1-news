#!/bin/bash

# Sett arbeidskatalog
cd /home/site/wwwroot

# Sett NODE_ENV
export NODE_ENV=production

# Installer avhengigheter
echo "Installing dependencies..."
npm install --production

# Sjekk om installasjonen var vellykket
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies"
    exit 1
fi

# Opprett logs-mappe
mkdir -p logs

# Start serveren med PM2
echo "Starting server..."
npm start > logs/server.log 2>&1 