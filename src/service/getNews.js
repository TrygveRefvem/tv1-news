export async function getNews() {
  const CACHE_KEY = 'newsData';
  const CACHE_EXPIRY_KEY = 'newsDataExpiry';
  const CACHE_DURATION = 60 * 60 * 1000;

  const isCacheValid = () => {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    if (!expiry) return false;
    return new Date().getTime() < parseInt(expiry, 10);
  };

  if (isCacheValid()) {
    console.log('Using cached data.');
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  }

  console.log('Fetching fresh data from server...');
  try {
    const response = await fetch('http://localhost:4040/api/news');
    if (!response.ok) {
      throw new Error('Failed to fetch news from server');
    }

    const newsWithIds = await response.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify(newsWithIds));
    localStorage.setItem(
      CACHE_EXPIRY_KEY,
      (Date.now() + CACHE_DURATION).toString()
    );

    return newsWithIds;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}
