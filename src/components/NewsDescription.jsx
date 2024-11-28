import { useNavigate, useLocation } from 'react-router-dom';

export function NewsDescription() {
  const location = useLocation();
  const navigate = useNavigate();
  const article = location.state;

  if (!article) {
    return <p>News not found</p>;
  }

  function GoBack() {
    navigate(-1);
  }

  return (
    <>
      <button onClick={GoBack} className="back-to-news">
        Back to News
      </button>
      <div className="article-container">
        <h1 className="article-title">{article.title}</h1>
        <p className="article-author">
          <span>Author: </span>
          {article.author}
        </p>
        <p className="article-description">{article.description}</p>
        <img className="article-img" src={article.image} alt="" />
        <p className="article-source">
          <span>Source:</span> {article.source}
        </p>
      </div>
    </>
  );
}
