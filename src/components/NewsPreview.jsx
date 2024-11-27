/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';

export function NewsPreview({ article }) {
  const Navigate = useNavigate();

  function ReadMore() {
    Navigate(`/${article.id}`);
  }
  return (
    <>
      <div className="news-preview">
        <div className="news-preview-content">
          <h1 className="news-title">{article.title}</h1>
          <p className="author">{article.author}</p>
          <p className="news-text">{article.description}</p>
          <p className="source">{article.source}</p>
        </div>
        <div className="news-preview-img">
          <img className="news-img" src={article.img} alt={article.title} />
          <button onClick={ReadMore} className="read-more-btn">
            Read More
          </button>
        </div>
      </div>
    </>
  );
}
