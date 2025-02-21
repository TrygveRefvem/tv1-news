/* eslint-disable no-undef */
import http from 'http';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Prosess feilhåndtering
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Logg stack trace
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Logg stack trace hvis tilgjengelig
  if (reason instanceof Error) {
    console.error('Stack:', reason.stack);
  }
});

// Konfigurer dotenv først
dotenv.config();

// Logg miljøvariabler (uten sensitive verdier)
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  WEBSITES_PORT: process.env.WEBSITES_PORT
});

const app = express();
const server = http.createServer(app);

// Express App Config
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// CORS middleware med bedre feilhåndtering
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://tv1.no',
    'http://tv1.no',
    'https://red-coast-0699c7710.4.azurestaticapps.net',
    'https://tv1-news-api-anbegpdkhmezczc0.northeurope-01.azurewebsites.net',
    'http://localhost:5173'
  ];

  try {
    const origin = req.headers.origin;
    console.log('Request origin:', origin);
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    next();
  } catch (error) {
    console.error('CORS error:', error);
    next(error);
  }
});

// Detaljert logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[${requestId}] Incoming ${req.method} ${req.url}`);
  console.log(`[${requestId}] Headers:`, req.headers);
  
  // Logg body for ikke-GET requests
  if (req.method !== 'GET') {
    console.log(`[${requestId}] Body:`, req.body);
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${requestId}] Completed ${req.method} ${req.url} ${res.statusCode} in ${duration}ms`);
  });
  
  next();
});

// Forbedret error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    code: err.code
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    requestId: req.requestId
  });
});

// Initialiser Gemini AI
const genAI = new GoogleGenerativeAI(process.env.VITE_GOOGLE_GENERATIVE_AI_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Rate limiting og køhåndtering
const requestQueue = [];
const processInterval = 1000;
let isProcessing = false;
const MAX_QUEUE_SIZE = 100;

// Minnebruk overvåkning
const checkMemoryUsage = () => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`,
  });
};

setInterval(checkMemoryUsage, 30000);

// Forbedret køprosessering
async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  const { resolve, reject, prompt, requestId } = requestQueue.shift();
  
  console.log(`[${requestId}] Processing queue item. Queue length: ${requestQueue.length}`);
  
  try {
    const response = await model.generateContent(prompt);
    const result = await response.response.text();
    console.log(`[${requestId}] Successfully processed queue item`);
    resolve(result);
  } catch (error) {
    console.error(`[${requestId}] Error processing queue item:`, error);
    reject(error);
  } finally {
    isProcessing = false;
    setTimeout(processQueue, processInterval);
  }
}

async function queueRequest(prompt) {
  const requestId = Math.random().toString(36).substring(7);
  
  if (requestQueue.length >= MAX_QUEUE_SIZE) {
    console.warn(`[${requestId}] Queue is full. Size: ${requestQueue.length}`);
    throw new Error('Request queue is full');
  }
  
  console.log(`[${requestId}] Adding request to queue. Current size: ${requestQueue.length}`);
  
  return new Promise((resolve, reject) => {
    requestQueue.push({ resolve, reject, prompt, requestId });
    processQueue();
  });
}

// API endpoints med forbedret feilhåndtering
app.post('/api/mood', async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Received mood analysis request`);
  
  try {
    const { titles, title, description } = req.body;

    if (titles) {
      const prompt = `For each of the following news headlines, analyze the political stance and return a score from -10 to +10, where:
        -10 indicates strongly pro-Russia/pro-Trump stance
        0 indicates neutral/balanced reporting
        +10 indicates strongly pro-Ukraine/anti-Trump stance
        
        Return only a list of numbers, without any explanations. The headlines are: ${JSON.stringify(titles)}`;

      const result = await queueRequest(prompt);
      const scores = JSON.parse(result);
      console.log(`[${requestId}] Successfully processed titles`);
      return res.json({ scores });
    }

    if (title && description) {
      const prompt = `Analyze this news article and make it more balanced in its reporting while maintaining the key facts:

        Title: "${title}"
        Description: "${description}"

        Return the new value as a **plain JSON** object with the format:
        {
          "title": "<rewritten balanced title here>",
          "description": "<rewritten balanced description here>"
        }

        Return ONLY this JSON object, without any additional text or explanations.`;

      const result = await queueRequest(prompt);
      const answer = result.replace(/```json|```/g, '').trim();
      const updatedArticle = JSON.parse(answer);
      console.log(`[${requestId}] Successfully processed article`);
      return res.json(updatedArticle);
    }

    console.warn(`[${requestId}] Invalid request payload`);
    return res.status(400).json({ error: 'Invalid request payload' });
  } catch (error) {
    console.error(`[${requestId}] Error in /api/mood:`, error);
    return res.status(500).json({ error: 'Internal Server Error', requestId });
  }
});

app.get('/api/news', async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Fetching news`);
  
  try {
    const apiKey = process.env.VITE_API_KEY;
    const params = {
      'api-key': apiKey,
      text: 'Ukraine Trump NATO geopolitics war',
      language: 'en',
      'earliest-publish-date': new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      number: 20,
      sort: 'publish-time',
      'sort-direction': 'DESC'
    };

    const urlParams = new URLSearchParams(params).toString();
    console.log(`[${requestId}] Fetching from World News API`);
    
    const response = await fetch(`https://api.worldnewsapi.com/search-news?${urlParams}`);

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error(`[${requestId}] World News API error:`, errorDetails);
      return res.status(500).json({ error: 'Failed to fetch news', requestId });
    }

    const data = await response.json();
    const newsWithIds = data.news.map((article, index) => ({
      ...article,
      id: `${index}-${article.title?.slice(0, 10)}`,
    }));

    console.log(`[${requestId}] Successfully fetched ${newsWithIds.length} articles`);
    return res.json(newsWithIds);
  } catch (error) {
    console.error(`[${requestId}] Error in /api/news:`, error);
    return res.status(500).json({ error: 'Internal Server Error', requestId });
  }
});

// Forbedret health check endpoint
app.get('/api/health', (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Health check request`);
  
  try {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
      memory: process.memoryUsage(),
      requestId
    };
    
    console.log(`[${requestId}] Health check success`);
    res.json(healthcheck);
  } catch (error) {
    console.error(`[${requestId}] Health check failed:`, error);
    res.status(503).json({
      error: 'Health check failed',
      message: error.message,
      requestId
    });
  }
});

// Server startup med forbedret feilhåndtering
const startServer = (retryCount = 0) => {
  const basePort = process.env.PORT || process.env.WEBSITES_PORT || 4040;
  const port = basePort + retryCount;

  console.log(`Attempting to start server on port ${port}`);

  server.listen(port)
    .on('error', (error) => {
      if (error.code === 'EADDRINUSE' && retryCount < 10) {
        console.log(`Port ${port} is in use, trying port ${basePort + retryCount + 1}...`);
        server.close();
        startServer(retryCount + 1);
      } else {
        console.error('Fatal server startup error:', error);
        process.exit(1);
      }
    })
    .on('listening', () => {
      console.log(`Server is running on port: ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log('Server startup complete');
      checkMemoryUsage();
    });
};

// Graceful shutdown
const shutdown = () => {
  console.log('Received shutdown signal');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start serveren
startServer();
