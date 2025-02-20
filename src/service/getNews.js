export async function getNews() {
  console.log('Fetching fresh data from server...');
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4040'}/api/news`);
    if (!response.ok) {
      throw new Error('Failed to fetch news from server');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}
