import React from 'react';
import { Link } from 'react-router-dom';
import { formatCount } from '../utils/tracking';
import { API_BASE } from '../config';

const truncateText = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function ArticleCardGrid({ article }) {
  const articleUrl = article.type ? 
          `/article/${article.type.toLowerCase()}/${article.slug}`: `/article/diskursus/${article.slug}`;
  
  // Get location name from geojson if available
  const locationName = article.location_geojson?.properties?.city || 
                       article.location_geojson?.properties?.name || 
                       '';

  return (
    <div className="card bg-transparent border-0 h-100">
      {/* Featured Image */}
      {article.featured_image && (
        <Link to={articleUrl}>
          <div
            className="img-responsive card-img-top rounded-0"
            style={{ 
              backgroundImage: `url(${article.featured_image.startsWith('/static/') ? `${API_BASE}${article.featured_image}` : article.featured_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </Link>
      )}
      {article.cover && (
        <Link to={articleUrl}>
          <div
            className="img-responsive rounded-0 card-img-top"
            style={{ 
              backgroundImage: `url(${article.cover.startsWith('/static/') ? `${API_BASE}${article.cover}` : article.cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </Link>
      )}

      {/* Card Body */}
      <div className="card-body px-0">
        {/* Article Type Badge & Location */}

        {/* Title */}
        <h5 className="card-title">
          <Link 
            to={articleUrl} 
            className="text-decoration-none text-orange"
            style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {article.title}
          </Link>
        </h5>

        {/* Lead Excerpt */}
        {article.lead_excerpt && (
          <p className="text-secondary">
            {truncateText(article.lead_excerpt, 155)}
          </p>
        )}
        {article.excerpt && (
          <p className="text-secondary">
            {truncateText(article.excerpt, 155)}
          </p>
        )}

        {/* Meta Information */}
        
      </div>
    </div>
  );
}