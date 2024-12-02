import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getNews } from '../service/getNews';
import { changeMood } from '../service/getGemini';

export function NewsDescription() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [article, setArticle] = useState(location.state);
  const [mood, setMood] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!article) {
      getNews().then((data) => {
        const foundArticle = data.find((a) => a.id === id);
        setArticle(foundArticle);
      });
    }
  }, [article, id]);

  if (!article) {
    return <p>News not found</p>;
  }

  const handleMoodChange = async () => {
    setLoading(true);
    try {
      const updatedArticle = await changeMood({
        title: article.title,
        description:
          article.text || article.summary || 'No description available',
      });
      setArticle((prevArticle) => ({
        ...prevArticle,
        title: updatedArticle.title,
        text: updatedArticle.description || 'No description available',
      }));
      console.log('updatedArticle', updatedArticle);
    } catch (error) {
      console.error('Error updating mood:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => navigate(-1)} className="back-to-news">
        Back to News
      </button>
      <div className="article-container">
        <h1 className="article-title">{article.title}</h1>
        <p className="article-author">
          <span>Author: </span>
          {article.authors?.join(', ') || 'Unknown'}
        </p>
        <p className="article-description">{article.text}</p>
        <img
          className="article-img"
          src={
            article.image ||
            'https://plus.unsplash.com/premium_photo-1688561384438-bfa9273e2c00?q=80&w=1470&auto=format&fit=crop'
          }
          alt={article.title}
        />
        <p>{article.publish_date}</p>
        <div className="mood-slider">
          <label className="label-mood-slider" htmlFor="mood">
            Mood: {mood}
          </label>
          <input
            id="mood"
            type="range"
            min="1"
            max="10"
            value={mood !== null ? mood : 5}
            onChange={(e) => setMood(Number(e.target.value))}
          />
        </div>
        <button
          onClick={handleMoodChange}
          className="update-article-btn"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Article Mood'}
        </button>
      </div>
    </>
  );
}
