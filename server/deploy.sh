#!/bin/bash

# Sett arbeidskatalog
cd /home/site/wwwroot

# Kopier server.js og package.json til rot-mappen
cp server/server.js .
cp server/package.json .

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

# Start serveren
echo "Starting server..."
node server.js > logs/server.log 2>&1 