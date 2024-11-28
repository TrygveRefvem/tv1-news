/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { NewsPreview } from './NewsPreview';
import { getNews } from '../service/getNews.js';

export function NewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then((data) => {
        setNews(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching news:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading news...</p>;
  }

  return (
    <div className="news-list">
      {news.map((article, index) => (
        <NewsPreview key={article.id || index} article={article} />
      ))}
    </div>
  );
}
