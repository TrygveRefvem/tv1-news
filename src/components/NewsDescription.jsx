import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getNews } from '../service/getNews';
import { changeMood } from '../service/getGemini';

export function NewsDescription() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [article, setArticle] = useState(location.state);
  const [loading, setLoading] = useState(false);

  const decodeHtml = (html) => {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value.replace(/\[&#8230;\]/g, '...').trim();
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    if (!article) {
      getNews().then((data) => {
        const foundArticle = data.find((a) => a.id === id);
        setArticle(foundArticle);
      });
    }
  }, [article, id]);

  if (!article) {
    return <div className="article-container"><p>Article not found</p></div>;
  }

  const handleMoodChange = async () => {
    setLoading(true);
    try {
      const updatedArticle = await changeMood({
        title: article.title,
        description: article.text || article.summary || 'No description available',
      });
      setArticle((prevArticle) => ({
        ...prevArticle,
        title: updatedArticle.title,
        text: updatedArticle.description || 'No description available',
      }));
    } catch (error) {
      console.error('Error updating mood:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-page">
      <button onClick={() => navigate(-1)} className="back-to-news">
        ← Back to News
      </button>
      <article className="article-container">
        <header className="article-header">
          <h1 className="article-title">{decodeHtml(article.title)}</h1>
          <div className="article-meta">
            <p className="article-author">
              <span>Author: </span>
              {article.authors?.join(', ') || 'Unknown'}
            </p>
            <p className="article-date">
              {formatDate(article.publish_date)}
            </p>
          </div>
        </header>
        
        <div className="article-content">
          <div className="article-text">
            {decodeHtml(article.text || article.summary)}
          </div>
          
          <figure className="article-image">
            <img
              src={
                article.image ||
                'https://plus.unsplash.com/premium_photo-1688561384438-bfa9273e2c00?q=80&w=1470&auto=format&fit=crop'
              }
              alt={decodeHtml(article.title)}
              className="article-img"
            />
          </figure>
        </div>

        <div className="article-actions">
          <button
            onClick={handleMoodChange}
            className="update-article-btn"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Balance Article'}
          </button>
        </div>
      </article>
    </div>
  );
}
