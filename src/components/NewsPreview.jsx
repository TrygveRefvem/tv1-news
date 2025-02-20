import { useNavigate } from 'react-router-dom';
import { processTitleMood } from '../service/getGemini';
import { useEffect, useState } from 'react';

export function NewsPreview({ article }) {
  const navigate = useNavigate();
  const formattedDate = new Date(article.publish_date).toDateString();
  const [bias, setBias] = useState(null);
  const [biasError, setBiasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value.replace(/\[&#8230;\]/g, '...').trim();
  };

  useEffect(() => {
    const fetchBias = async () => {
      try {
        const scores = await processTitleMood([article.title]);
        if (scores && scores[0] !== undefined) {
          setBias(scores[0]);
          setBiasError(false);
        } else {
          throw new Error('Invalid score received');
        }
      } catch (error) {
        console.error('Error analyzing bias:', error);
        setBiasError(true);
        // Retry up to 3 times with increasing delays
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000 * (retryCount + 1)); // 2s, 4s, 6s delays
        }
      }
    };
    fetchBias();
  }, [article.title, retryCount]);

  const getBiasDisplay = () => {
    if (biasError) {
      if (retryCount < 3) {
        return <span className="bias-loading">Waiting for analysis... ({retryCount + 1}/3)</span>;
      }
      return null;
    }
    if (bias === null) {
      return <span className="bias-loading">Analyzing political bias...</span>;
    }

    let biasText;
    let biasClass;
    
    if (bias <= -7) {
      biasText = 'Strongly Pro-Trump/Russia';
      biasClass = 'strong-right';
    } else if (bias <= -3) {
      biasText = 'Moderately Pro-Trump/Russia';
      biasClass = 'moderate-right';
    } else if (bias <= 3) {
      biasText = 'Balanced';
      biasClass = 'neutral';
    } else if (bias <= 7) {
      biasText = 'Moderately Pro-Ukraine';
      biasClass = 'moderate-left';
    } else {
      biasText = 'Strongly Pro-Ukraine';
      biasClass = 'strong-left';
    }

    return (
      <div className="bias-indicator">
        <span className="bias-label">Political Bias:</span>
        <span className={`bias-value ${biasClass}`}>
          {biasText}
        </span>
      </div>
    );
  };

  return (
    <div className="news-preview">
      <div className="news-preview-content">
        <h1 className="news-title">{decodeHtml(article.title)}</h1>
        <p className="news-date">{formattedDate}</p>
        <p className="author">{article.authors?.join(', ') || 'Unknown'}</p>
        <p className="news-text">
          {decodeHtml(article.summary) || 'No summary available.'}
        </p>
        {getBiasDisplay()}
      </div>
      <div className="news-preview-img">
        <img
          className="news-img"
          src={
            article.image ||
            'https://plus.unsplash.com/premium_photo-1688561384438-bfa9273e2c00?q=80&w=1470&auto=format&fit=crop'
          }
          alt={decodeHtml(article.title)}
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

//add new env file
