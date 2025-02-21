export async function getNews() {
  console.log('Fetching fresh data from server...');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4040';
  console.log('Using API URL:', apiUrl);
  
  try {
    const response = await fetch(`${apiUrl}/api/news`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error('Server response not OK:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response text:', text);
      throw new Error(`Failed to fetch news from server: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Received data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}
