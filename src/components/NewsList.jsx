/* eslint-disable react/prop-types */
import { NewsPreview } from './NewsPreview';

export function NewsList({ news }) {
  return (
    <div className="news-list">
      {news.map((article) => (
        <NewsPreview key={article.id} article={article} />
      ))}
    </div>
  );
}
