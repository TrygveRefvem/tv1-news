#!/bin/bash

# Sett arbeidskatalog
cd /home/site/wwwroot

# Sett miljøvariabler
export NODE_ENV=production
export PORT=8080
export WEBSITES_PORT=8080
export VITE_API_KEY=9957e8d299a340f6bf39141a7ae970a5
export VITE_WORLD_NEWS_API_KEY=9957e8d299a340f6bf39141a7ae970a5
export VITE_GOOGLE_GENERATIVE_AI_KEY=AIzaSyAPET1GbmQ0b9i_23Hv7vNwLO5OvDWyP8M

# Kopier server.js til rot-mappen
cp server/server.js .

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

# Start serveren
echo "Starting server..."
node server.js > logs/server.log 2>&1 