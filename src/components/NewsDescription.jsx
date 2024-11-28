import { useNavigate, useLocation } from 'react-router-dom';

export function NewsDescription() {
  const location = useLocation();
  const navigate = useNavigate();
  const article = location.state;
  const formattedDate = new Date(article.published_at).toDateString();

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
        <img
          className="article-img"
          src={
            article.image ||
            'https://plus.unsplash.com/premium_photo-1688561384438-bfa9273e2c00?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          }
          alt=""
        />
        <p className="Data"> {formattedDate}</p>
        <p className="article-source">
          <span>Source:</span> {article.source}
        </p>
      </div>
    </>
  );
}
