const url = 'https://api.worldnewsapi.com/search-news';
const apiKey = import.meta.env.VITE_API_KEY; // Replace with your actual API key
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
    text: 'earth quake',
    language: 'en',
    'earliest-publish-date': '2024-11-10',
    number: 10,
  };

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

    if (!data.news || !Array.isArray(data.news)) {
      throw new Error('Unexpected API response format.');
    }

    const newsWithIds = data.news.map((article, index) => ({
      ...article,
      id: `${index}-${article.title?.slice(0, 10)}`,
    }));

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
