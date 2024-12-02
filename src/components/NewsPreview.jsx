// import { useNavigate } from 'react-router-dom';

// export function NewsPreview({ article }) {
//   const Navigate = useNavigate();

//   function ReadMore() {
//     Navigate(`/${article.id}`, { state: article });
//   }

//   const newDate = new Date(article.published_at);
//   const formattedDate = newDate.toDateString();

//   return (
//     <>
//       <div className="news-preview">
//         <div className="news-preview-content">
//           <h1 className="news-title">{article.title}</h1>
//           <p className="news-date">{formattedDate}</p>
//           <p className="author">{article.author}</p>
//           <p className="news-text">{article.description}</p>
//           <p className="source">{article.source}</p>
//         </div>
//         <div className="news-preview-img">
//           <img
//             className="news-img"
//             src={
//               article.image ||
//               'https://plus.unsplash.com/premium_photo-1688561384438-bfa9273e2c00?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
//             }
//             alt={article.title}
//           />
//           <button onClick={ReadMore} className="read-more-btn">
//             Read More
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

// src/components/NewsPreview.js
import { useNavigate } from 'react-router-dom';

export function NewsPreview({ article }) {
  const navigate = useNavigate();

  const formattedDate = new Date(article.publish_date).toDateString();

  return (
    <div className="news-preview">
      <div className="news-preview-content">
        <h1 className="news-title">{article.title}</h1>
        <p className="news-date">{formattedDate}</p>
        <p className="author">{article.authors?.join(', ') || 'Unknown'}</p>
        <p className="news-text">
          {article.summary || 'No summary available.'}
        </p>
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
