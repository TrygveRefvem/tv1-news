export async function processTitleMood(titles) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4040';
  console.log('Using API URL for mood analysis:', apiUrl);
  
  try {
    const response = await fetch(`${apiUrl}/api/mood`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ titles })
    });

    if (!response.ok) {
      console.error('Server response not OK:', response.status, response.statusText);
      throw new Error('Failed to process title mood');
    }

    const data = await response.json();
    return data.scores;
  } catch (error) {
    console.error('Error in processTitleMood:', error);
    return titles.map(() => null);
  }
}

export async function changeMood(data) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4040';
  console.log('Using API URL for mood change:', apiUrl);
  
  try {
    const response = await fetch(`${apiUrl}/api/mood`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error('Server response not OK:', response.status, response.statusText);
      throw new Error('Failed to change mood');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in changeMood:', error);
    return { title: data.title, description: data.description };
  }
}
