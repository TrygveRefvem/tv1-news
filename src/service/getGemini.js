export async function processTitleMood(titles) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4040'}/api/mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titles }), // Send titles to backend
    });

    if (!response.ok) {
      throw new Error('Failed to process title mood');
    }

    const data = await response.json();
    return data.scores; // Return the scores from the backend
  } catch (error) {
    console.error('Error in processTitleMood:', error);
    return titles.map(() => null); // Return null for each title on failure
  }
}

export async function changeMood(data) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4040'}/api/mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data), // Send title and description to backend
    });

    if (!response.ok) {
      throw new Error('Failed to change mood');
    }

    return await response.json(); // Return the updated article from the backend
  } catch (error) {
    console.error('Error in changeMood:', error);
    return { title: data.title, description: data.description }; // Return original data on failure
  }
}
