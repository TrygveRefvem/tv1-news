// // /* eslint-disable no-undef */

// import { makeId } from './utils.js';
// const url = `http://api.mediastack.com/v1/news`;

// export function getNews() {
//   const params = {
//     languages: 'en',
//     countries: 'us,il,ae',
//     access_key: import.meta.env.VITE_MEDIASTACK_API_KEY,
//     keywords: 'israel,palestine',
//     limit: 10,
//   };
//   const urlParams = new URLSearchParams(params).toString();

//   // Define cache keys
//   const cacheKey = `newsCache_${urlParams}`;
//   const cacheExpiryKey = `newsCacheExpiry_${urlParams}`;
//   const now = Date.now();

//   // Check if cached data exists and is still valid
//   const cachedData = localStorage.getItem(cacheKey);
//   const cacheExpiry = localStorage.getItem(cacheExpiryKey);

//   if (cachedData && cacheExpiry && now < parseInt(cacheExpiry, 10)) {
//     console.log('Using cached data...');
//     return Promise.resolve(JSON.parse(cachedData));
//   }

//   console.log('Fetching fresh data...');
//   return fetch(`${url}?${urlParams}`)
//     .then((res) => res.json())
//     .then((res) => {
//       // Assign unique IDs to articles
//       const newsWithIds = res.data.map((article) => ({
//         ...article,
//         id: makeId(), // Add unique ID to each article
//       }));

//       // Cache the fetched data
//       localStorage.setItem(cacheKey, JSON.stringify(newsWithIds));
//       // Set cache to expire in 1 hour (3600000 milliseconds)
//       localStorage.setItem(cacheExpiryKey, now + 3600000);

//       return newsWithIds;
//     })
//     .catch((error) => {
//       console.error('Error fetching data:', error);
//       // Return an empty array if fetch fails
//       return [];
//     });
// }

// src/service/getNews.js

// src/service/getNews.js

const url = 'https://api.worldnewsapi.com/search-news';
const apiKey = '2ac81b88069449f299b4bc7395dc1870'; // Replace with your actual API key
const CACHE_KEY = 'newsData';
const CACHE_EXPIRY_KEY = 'newsDataExpiry';
const CACHE_DURATION = 60 * 60 * 1000; // Cache duration: 1 hour

// Function to check if cache is valid
const isCacheValid = () => {
  const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
  if (!expiry) return false;
  return new Date().getTime() < parseInt(expiry, 10);
};

// Fetch or use cache
export async function getNews() {
  if (isCacheValid()) {
    console.log('Using cached data.');
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  }

  console.log('Fetching fresh data from API...');
  const params = {
    text: 'earth quake', // Specify the topic
    language: 'en', // Specify language
    'earliest-publish-date': '2024-11-10', // Specify publish date range
    number: 10, // Limit results
  };

  // Build query string
  const urlParams = new URLSearchParams(params).toString();

  try {
    console.log('Request URL:', `${url}?${urlParams}`);
    console.log('API Key:', apiKey);

    const response = await fetch(`${url}?${urlParams}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Error details:', errorDetails);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Check if the response includes expected data
    if (!data.news || !Array.isArray(data.news)) {
      throw new Error('Unexpected API response format.');
    }

    const newsWithIds = data.news.map((article, index) => ({
      ...article,
      id: `${index}-${article.title?.slice(0, 10)}`, // Generate unique IDs
    }));

    // Cache the data
    localStorage.setItem(CACHE_KEY, JSON.stringify(newsWithIds));
    localStorage.setItem(
      CACHE_EXPIRY_KEY,
      (Date.now() + CACHE_DURATION).toString()
    );

    return newsWithIds;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}
