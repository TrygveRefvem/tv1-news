import { useNavigate } from 'react-router-dom';
import { processTitleMood } from '../service/getGemini';
import { useEffect, useState } from 'react';

export function NewsPreview({ article }) {
  const navigate = useNavigate();
  const formattedDate = new Date(article.publish_date).toDateString();
  const [mood, setMood] = useState(null);

  useEffect(() => {
    const FatchMood = async () => {
      const scores = await processTitleMood([article.title]);
      setMood(scores[0]);
    };
    FatchMood();
  }, [article.title]);

  return (
    <div className="news-preview">
      <div className="news-preview-content">
        <h1 className="news-title">{article.title}</h1>
        <p className="news-date">{formattedDate}</p>
        <p className="author">{article.authors?.join(', ') || 'Unknown'}</p>
        <p className="news-text">
          {article.summary || 'No summary available.'}
        </p>
        <p>Mood: {mood !== null ? mood : 'Loading...'}</p>
      </div>
      <div className="news-preview-img">
        <img
          className="news-img"
          src={
            article.image ||
            'https://plus.unsplash.com/premium_photo-1688561384438-bfa9273e2c00?q=80&w=1470&auto=format&fit=crop'
          }
          alt={article.title}
        />
        <button
          onClick={() => navigate(`/${article.id}`, { state: article })}
          className="read-more-btn"
        >
          Read More
        </button>
      </div>
    </div>
  );
}
