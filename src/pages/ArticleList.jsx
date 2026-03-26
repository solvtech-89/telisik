import { useEffect, useState } from "react";
import { API_BASE } from "../config";

export default function ArticleList({ onSelect }) {
  const [articles, setArticles] = useState([]);

  async function fetchArticles() {
    try {
      const resp = await fetch(`${API_BASE}/api/articles/`);
      const data = await resp.json();
      setArticles(data);
    } catch (err) {
      console.error("Failed to load articles", err);
    }
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {articles.map((a) => (
        <div key={a.slug} className="mb-3">
          <div
            className="bg-white rounded shadow h-full cursor-pointer overflow-hidden"
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(a)}
          >
            <img
              src={a.featured_image || "/placeholder.png"}
              alt={a.title}
              className="w-full"
              style={{ objectFit: "cover", height: 150 }}
            />
            <div className="p-3">
              <h6 className="text-sm font-medium truncate">{a.title}</h6>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
