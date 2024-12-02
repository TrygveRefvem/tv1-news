// import { useEffect, useState } from 'react';
// import { NewsPreview } from './NewsPreview';
// import { getNews } from '../service/getNews.js';

// export function NewsList() {
//   const [news, setNews] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getNews()
//       .then((data) => {
//         setNews(data);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error('Error fetching news:', error);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return <div className="loader"></div>;
//   }

//   return (
//     <div className="news-list">
//       {news.map((article) => (
//         <NewsPreview key={article.id} article={article} />
//       ))}
//     </div>
//   );
// }

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
    return <div className="loader"></div>;
  }

  if (news.length === 0) {
    return <p>No news articles found. Please try again later.</p>;
  }

  return (
    <div className="news-list">
      {news.map((article) => (
        <NewsPreview key={article.id} article={article} />
      ))}
    </div>
  );
}
