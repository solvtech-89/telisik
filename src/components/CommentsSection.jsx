import React, { useState, useEffect } from 'react';
import { MessageCircle, Share2, User } from 'lucide-react';
import { API_BASE } from '../config';
import "./CommentSection.css";

function CommentCard({ comment, onReply, depth = 0 }) {
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 3;

  function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);

    const intervals = {
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const counter = Math.floor(seconds / secondsInUnit);
      if (counter >= 1) {
        return `${counter}${unit.charAt(0)}`;
      }
    }
    return 'now';
  }

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <div className="comment-wrapper">
      <div className="comment-item">
        <div className="comment-avatar">
          {comment.created_by?.avatar ? (
            <img src={comment.created_by.avatar} alt={comment.created_by.username} />
          ) : (
            <User size={20} />
          )}
        </div>
        
        <div className="comment-content-area">
          <div className="comment-header">
            <span className="comment-author">Display Name</span>
            <span className="comment-username">@{comment.created_by?.username || 'username'}</span>
            <span className="comment-time">• {timeAgo(comment.created_at)}</span>
          </div>

          <div className="comment-body">
            {comment.context_info?.type && (
              <h5 className="comment-title">
                {comment.context_info.type === 'paragraph' && 
                  `Re: ${comment.context_info.section} - Paragraph ${comment.context_info.paragraph_order}`}
                {comment.context_info.type === 'timeline_paragraph' && 
                  `Re: ${comment.context_info.timeline_title}`}
                {(comment.context_info.type === 'article' || comment.context_info.type === 'diskursus') && 
                  'Heading H5 (Opsional) Maksimal 60 Karakter Lorem Ipsum Dolor'}
              </h5>
            )}
            
            <p className="comment-text">{comment.content}</p>
            
            {comment.selected_text && (
              <blockquote className="comment-quote">
                "{comment.selected_text}"
              </blockquote>
            )}

            <div className="comment-footer">
              <button className="comment-action">
                <MessageCircle size={16} />
                <span>9,999</span>
              </button>
              <button className="comment-action">
                <Share2 size={16} />
                <span>9,999</span>
              </button>
              {depth < maxDepth && (
                <button 
                  className="comment-action-link"
                  onClick={() => setShowReplyBox(!showReplyBox)}
                >
                  Tanggapi
                </button>
              )}
            </div>

            {showReplyBox && (
              <div className="reply-box">
                <textarea
                  className="reply-input"
                  rows="3"
                  placeholder="Tulis tanggapan..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="reply-actions">
                  <button className="btn-reply-cancel" onClick={() => setShowReplyBox(false)}>
                    Batal
                  </button>
                  <button className="btn-reply-submit" onClick={handleReplySubmit}>
                    Kirim
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasReplies && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentCard 
              key={reply.id} 
              comment={reply} 
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsSection({ articleSlug, tipe }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchComments(1);
  }, [articleSlug, tipe]);

  useEffect(() => {
    const handleScroll = (e) => {
      if (loadingMore || !hasMore) return;

      // Target the middle column scroll container
      const scrollContainer = document.getElementById('middle-col-scroll');
      if (!scrollContainer) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // Load more when within 300px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        fetchComments(currentPage + 1, true);
      }
    };

    const scrollContainer = document.getElementById('middle-col-scroll');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [loadingMore, hasMore, currentPage]);

  const fetchComments = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/articles/${tipe}/${articleSlug}/comments/?page=${page}&limit=10`
      );
      const data = await response.json();

      if (append) {
        setComments((prev) => [...prev, ...(data.results || [])]);
      } else {
        setComments(data.results || []);
      }

      setHasMore(!!data.next);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleReply = async (parentId, content) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${API_BASE}/api/articles/${tipe}/${articleSlug}/comments/add/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            content,
            parent_id: parentId,
            comment_type: 'article',
          }),
        }
      );

      if (response.ok) {
        fetchComments(1);
      }
    } catch (err) {
      console.error('Failed to submit reply:', err);
      alert('Gagal mengirim tanggapan');
    }
  };

  if (loading) {
    return (
      <div className="comments-section">
      <h2 className="comments-title">Tanggapan</h2>
        <div className="comments-loading">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <h2 className="comments-title">Tanggapan</h2>
      <hr className="comments-divider" />
      {comments.length === 0 ? (
        <p className="comments-empty">Belum ada tanggapan</p>
      ) : (
        <>
          <div className="comments-listed">
            {comments.map((comment) => (
              <CommentCard 
                key={comment.id} 
                comment={comment} 
                onReply={handleReply}
              />
            ))}
          </div>
          
          {loadingMore && (
            <div className="comments-loading-more">
              Loading more comments...
            </div>
          )}
        </>
      )}
    </div>
  );
}