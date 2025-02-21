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
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

dotenv.config();
const app = express();
const server = http.createServer(app);

// Express App Config
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://red-coast-0699c7710.4.azurestaticapps.net']
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting setup
const requestQueue = [];
const processInterval = 1000; // 1 second between requests
let isProcessing = false;
const MAX_QUEUE_SIZE = 100;

// Minnebruk overvåkning
const checkMemoryUsage = () => {
  const used = process.memoryUsage();
  console.log({
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`,
  });
};

setInterval(checkMemoryUsage, 30000);

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  const { resolve, reject, prompt } = requestQueue.shift();
  
  try {
    const response = await model.generateContent(prompt);
    const result = await response.response.text();
    resolve(result);
  } catch (error) {
    console.error('Error in processQueue:', error);
    reject(error);
  } finally {
    isProcessing = false;
    setTimeout(processQueue, processInterval);
  }
}

// Sjekk om nødvendige miljøvariabler er satt
const requiredEnvVars = ['VITE_GOOGLE_GENERATIVE_AI_KEY', 'VITE_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.VITE_GOOGLE_GENERATIVE_AI_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function queueRequest(prompt) {
  if (requestQueue.length >= MAX_QUEUE_SIZE) {
    throw new Error('Request queue is full');
  }
  
  return new Promise((resolve, reject) => {
    requestQueue.push({ resolve, reject, prompt });
    processQueue();
  });
}

app.post('/api/mood', async (req, res) => {
  const { titles, title, description } = req.body;

  try {
    if (titles) {
      const prompt = `For each of the following news headlines, analyze the political stance and return a score from -10 to +10, where:
        -10 indicates strongly pro-Russia/pro-Trump stance
        0 indicates neutral/balanced reporting
        +10 indicates strongly pro-Ukraine/anti-Trump stance
        
        Return only a list of numbers, without any explanations. The headlines are: ${JSON.stringify(titles)}`;

      const result = await queueRequest(prompt);
      const scores = JSON.parse(result);
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
      return res.json(updatedArticle);
    }

    return res.status(400).json({ error: 'Invalid request payload' });
  } catch (error) {
    console.error('Error in /api/mood:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/news', async (req, res) => {
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

  try {
    const urlParams = new URLSearchParams(params).toString();
    const response = await fetch(`https://api.worldnewsapi.com/search-news?${urlParams}`);

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Error details:', errorDetails);
      return res.status(500).json({ error: 'Failed to fetch news' });
    }

    const data = await response.json();
    const newsWithIds = data.news.map((article, index) => ({
      ...article,
      id: `${index}-${article.title?.slice(0, 10)}`,
    }));

    return res.json(newsWithIds);
  } catch (error) {
    console.error('Error in /api/news:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Forbedret helsesjekk endpoint
app.get('/api/health', (req, res) => {
  try {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      queueSize: requestQueue.length,
      environment: process.env.NODE_ENV,
      version: process.version
    };
    
    // Sjekk om vi kan koble til World News API
    fetch('https://api.worldnewsapi.com/search-news?api-key=' + process.env.VITE_API_KEY + '&number=1')
      .then(() => {
        healthStatus.worldNewsApi = 'connected';
        res.json(healthStatus);
      })
      .catch(error => {
        healthStatus.worldNewsApi = 'error';
        healthStatus.worldNewsApiError = error.message;
        res.json(healthStatus);
      });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

const port = process.env.PORT || process.env.WEBSITES_PORT || 4040;

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

server.listen(port, () => {
  console.log('Server is running on port:', port);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('CORS origins:', corsOptions.origin);
  checkMemoryUsage();
});
