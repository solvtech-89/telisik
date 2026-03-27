import React, { useState, useEffect } from "react";
import { MessageCircle, Share2, User } from "lucide-react";
import { API_BASE } from "../config";

function CommentCard({ comment, onReply, depth = 0 }) {
  const [replyText, setReplyText] = useState("");
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
    return "now";
  }

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText("");
    setShowReplyBox(false);
  };

  return (
    <div className="border-b border-gray-200 py-5 first:pt-0">
      <div className="flex gap-3">
        <div className="h-9 w-9 min-w-9 overflow-hidden rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
          {comment.created_by?.avatar ? (
            <img
              className="h-full w-full object-cover"
              src={comment.created_by.avatar}
              alt={comment.created_by.username}
            />
          ) : (
            <User size={20} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-sm font-semibold text-black">
              Display Name
            </span>
            <span className="text-[0.85rem] text-gray-600">
              @{comment.created_by?.username || "username"}
            </span>
            <span className="text-[0.85rem] text-gray-400">
              • {timeAgo(comment.created_at)}
            </span>
          </div>

          <div className="text-gray-700">
            {comment.context_info?.type && (
              <h5 className="mb-2 text-[0.95rem] font-semibold leading-[1.4] text-black">
                {comment.context_info.type === "paragraph" &&
                  `Re: ${comment.context_info.section} - Paragraph ${comment.context_info.paragraph_order}`}
                {comment.context_info.type === "timeline_paragraph" &&
                  `Re: ${comment.context_info.timeline_title}`}
                {(comment.context_info.type === "article" ||
                  comment.context_info.type === "diskursus") &&
                  "Heading H5 (Opsional) Maksimal 60 Karakter Lorem Ipsum Dolor"}
              </h5>
            )}

            <p className="mb-2 whitespace-pre-wrap break-words text-[0.9rem] leading-[1.6] text-gray-700">
              {comment.content}
            </p>

            {comment.selected_text && (
              <blockquote className="my-3 border-l-[3px] border-l-[#ff6b35] bg-gray-100 px-3 py-2 text-[0.85rem] italic text-gray-500">
                "{comment.selected_text}"
              </blockquote>
            )}

            <div className="mt-2 flex items-center gap-3">
              <button className="flex items-center gap-1 rounded px-2 py-1 text-[0.85rem] text-gray-600 hover:bg-gray-100">
                <MessageCircle size={16} />
                <span>9,999</span>
              </button>
              <button className="flex items-center gap-1 rounded px-2 py-1 text-[0.85rem] text-gray-600 hover:bg-gray-100">
                <Share2 size={16} />
                <span>9,999</span>
              </button>
              {depth < maxDepth && (
                <button
                  className="rounded px-2 py-1 text-[0.85rem] text-gray-600 underline hover:text-black"
                  onClick={() => setShowReplyBox(!showReplyBox)}
                >
                  Tanggapi
                </button>
              )}
            </div>

            {showReplyBox && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <textarea
                  className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-[0.9rem] focus:border-[#ff6b35] focus:outline-none"
                  rows="3"
                  placeholder="Tulis tanggapan..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    className="rounded-md bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                    onClick={() => setShowReplyBox(false)}
                  >
                    Batal
                  </button>
                  <button
                    className="rounded-md bg-[#ff6b35] px-5 py-2 text-sm font-medium text-white hover:bg-[#e55a2b]"
                    onClick={handleReplySubmit}
                  >
                    Kirim
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasReplies && (
        <div className="ml-8 mt-4 md:ml-11">
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
      const scrollContainer = document.getElementById("middle-col-scroll");
      if (!scrollContainer) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // Load more when within 300px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        fetchComments(currentPage + 1, true);
      }
    };

    const scrollContainer = document.getElementById("middle-col-scroll");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [loadingMore, hasMore, currentPage, articleSlug, tipe]);

  const fetchComments = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/articles/${tipe}/${articleSlug}/comments/?page=${page}&limit=10`,
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
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleReply = async (parentId, content) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE}/api/articles/${tipe}/${articleSlug}/comments/add/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            content,
            parent_id: parentId,
            comment_type: "article",
          }),
        },
      );

      if (response.ok) {
        fetchComments(1);
      }
    } catch (err) {
      console.error("Failed to submit reply:", err);
      alert("Gagal mengirim tanggapan");
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <h2 className="mb-2 text-2xl text-[#ff6b35]">Tanggapan</h2>
        <div className="p-8 text-center text-gray-400">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-2 text-2xl text-[#ff6b35]">Tanggapan</h2>
      <hr className="mb-6 mt-1 border-gray-300" />
      {comments.length === 0 ? (
        <p className="p-8 text-center text-gray-400">Belum ada tanggapan</p>
      ) : (
        <>
          <div className="flex flex-col">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onReply={handleReply}
              />
            ))}
          </div>

          {loadingMore && (
            <div className="p-4 text-center text-sm text-gray-400">
              Loading more comments...
            </div>
          )}
        </>
      )}
    </div>
  );
}
