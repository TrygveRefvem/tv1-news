export async function getNews() {
  console.log('Fetching fresh data from server...');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4040';
  console.log('Using API URL:', apiUrl);
  
  try {
    const response = await fetch(`${apiUrl}/api/news`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Server response not OK:', response.status, response.statusText);
      throw new Error('Failed to fetch news from server');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}
