#!/bin/bash

# Sett miljøvariabler
export PORT=8080
export WEBSITES_PORT=8080
export NODE_ENV=production
export VITE_API_KEY=9957e8d299a340f6bf39141a7ae970a5
export VITE_WORLD_NEWS_API_KEY=9957e8d299a340f6bf39141a7ae970a5
export VITE_GOOGLE_GENERATIVE_AI_KEY=AIzaSyAPET1GbmQ0b9i_23Hv7vNwLO5OvDWyP8M

# Installer avhengigheter
echo "Installing dependencies..."
npm install --production

# Sjekk om installasjonen var vellykket
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies"
    exit 1
fi

# Start serveren
echo "Starting server..."
node server.js 