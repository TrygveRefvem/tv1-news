import { useEffect, useState } from 'react';
import { NewsPreview } from './NewsPreview';
import { getNews } from '../service/getNews.js';

export function NewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then((data) => {
        if (data.length === 0) {
          console.warn('No news articles found.');
        }
        setNews(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching news:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loader">Loading latest news...</div>;
  }

  if (news.length === 0) {
    return <p>No news articles found. Please try again later.</p>;
  }

  const formatDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="news-list">
      <header className="news-list-header">
        <h1>Global Geopolitics Today</h1>
        <p>{formatDate()}</p>
      </header>
      <div className="news-grid">
        {news.map((article) => (
          <NewsPreview key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
