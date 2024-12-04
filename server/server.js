/* eslint-disable no-undef */
import http from 'http';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const app = express();
const server = http.createServer(app);

// Express App Config
app.use(cookieParser());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist', 'index.html'));
  });
} else {
  const corsOptions = {
    origin: [
      'http://127.0.0.1:4040',
      'http://localhost:4040',
      'http://127.0.0.1:5173',
      'http://localhost:5173',
    ],
    credentials: true,
  };
  app.use(cors(corsOptions));
}

// Create

const genAI = new GoogleGenerativeAI(process.env.VITE_GOOGLE_GENERATIVE_AI_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/api/mood', async (req, res) => {
  const { titles, title, description } = req.body;

  try {
    if (titles) {
      const prompt = `For each sentence of the following sentences, 
        give a score based on sentiment analysis, ranging from 0 to 10,
        0 being the most friendly, supportive and empathetic, while 10
        is the most aggressive and charged. Return only a list of numbers,
        without any further explanations. The sentences are: ${JSON.stringify(
          titles
        )}`;

      const response = await model.generateContent(prompt);
      const result = await response.response.text();
      const scores = JSON.parse(result);

      return res.json({ scores });
    }

    if (title && description) {
      const prompt = `I will give you a title and a news story. You need to 
        make them both calmer, more empathetic, and more positive without losing
        any of the important existing facts.

        Title: "${title}"

        Description: "${description}"

        Return the new value as a **plain JSON** object with the format:
        {
          "title": "<new updated title here>",
          "description": "<new updated description here>"
        }

        Return ONLY this JSON object, without any additional text or explanations.`;

      const response = await model.generateContent(prompt);
      let answer = await response.response.text();

      answer = answer.replace(/```json|```/g, '').trim();
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
  const url = `https://api.worldnewsapi.com/search-news?api-key=${apiKey}&text=sport.`;
  const params = {
    text: 'sport',
    language: 'en',
    'earliest-publish-date': '2024-11-10',
    number: 10,
  };

  try {
    const urlParams = new URLSearchParams(params).toString();
    const response = await fetch(`${url}?${urlParams}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    });

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

const port = process.env.PORT || 4040;
server.listen(port, () => {
  console.log('Server is running on port:', port);
});
