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
  if (error.code === 'EADDRINUSE') {
    console.log('Port er allerede i bruk. Prøver en annen port...');
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  } else {
    console.error('Fatal error. Exiting...');
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Sjekk om nødvendige miljøvariabler er satt
const requiredEnvVars = ['VITE_GOOGLE_GENERATIVE_AI_KEY', 'VITE_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

dotenv.config();
const app = express();
const server = http.createServer(app);

// Express App Config
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Basic CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).send();
  }
});

const startServer = (retryCount = 0) => {
  const basePort = process.env.PORT || process.env.WEBSITES_PORT || 4040;
  const port = basePort + retryCount;

  server.listen(port)
    .on('error', (error) => {
      if (error.code === 'EADDRINUSE' && retryCount < 10) {
        console.log(`Port ${port} er opptatt, prøver port ${basePort + retryCount + 1}...`);
        server.close();
        startServer(retryCount + 1);
      } else {
        console.error('Server startup error:', error);
        process.exit(1);
      }
    })
    .on('listening', () => {
      console.log('Server is running on port:', port);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('CORS origins:', corsOptions.origin);
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
