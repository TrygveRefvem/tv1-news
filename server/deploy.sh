#!/bin/bash

# Sett miljøvariabler
export NODE_ENV=production
export PORT=8080
export WEBSITES_PORT=8080
export VITE_API_KEY=9957e8d299a340f6bf39141a7ae970a5
export VITE_WORLD_NEWS_API_KEY=9957e8d299a340f6bf39141a7ae970a5
export VITE_GOOGLE_GENERATIVE_AI_KEY=AIzaSyAPET1GbmQ0b9i_23Hv7vNwLO5OvDWyP8M

# Installer avhengigheter
npm install

# Start serveren
node server.js 