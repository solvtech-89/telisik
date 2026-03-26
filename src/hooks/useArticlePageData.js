import { useEffect, useRef, useState } from "react";
import { API_BASE, WS_BASE } from "../config";

function buildFootnoteNumberMap(sections) {
  let counter = 0;
  const map = {};
  if (!sections) return {};
  sections.forEach((section) => {
    (section.paragraphs || [])
      .filter((p) => !p.is_deleted)
      .sort((a, b) => a.order - b.order)
      .forEach((paragraph) => {
        (paragraph.footnotes || []).forEach((fn) => {
          if (!map[fn.id]) {
            counter += 1;
            map[fn.id] = counter;
          }
        });
      });
  });
  return map;
}

/**
 * Fetches and manages article data, sections, contributors, and WebSocket
 * updates for a single article view.
 */
export function useArticlePageData({ slug, tipe, isDiskursus, setAlert }) {
  const [article, setArticle] = useState(null);
  const [contributor, setContributor] = useState(null);
  const [sections, setSections] = useState(null);
  const wsRef = useRef(null);

  async function fetchArticle() {
    try {
      const resp = await fetch(`${API_BASE}/api/articles/${tipe}/${slug}/`);
      if (!resp.ok) throw new Error("Failed to load article");
      const data = await resp.json();
      setArticle(data.article ?? data);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to load article." });
    }
  }

  async function fetchSections() {
    if (isDiskursus) {
      setSections([]);
      return;
    }
    try {
      const resp = await fetch(
        `${API_BASE}/api/articles/${tipe}/${slug}/sections/`,
      );
      if (!resp.ok) {
        if (resp.status === 400) {
          setSections([]);
          return;
        }
        throw new Error("Failed to load sections");
      }
      const data = await resp.json();
      setSections(data);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to load sections." });
    }
  }

  async function fetchContributors() {
    try {
      const resp = await fetch(
        `${API_BASE}/api/articles/${tipe}/${slug}/contributors/`,
      );
      if (!resp.ok) throw new Error("Failed to load contributors");
      const data = await resp.json();
      setContributor(data.contributors ?? data);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to load contributors." });
    }
  }

  const retryLoadArticle = () => {
    fetchArticle();
    fetchSections();
    fetchContributors();
  };

  useEffect(() => {
    fetchArticle();
    fetchSections();
    fetchContributors();

    if (!isDiskursus) {
      const ws = new WebSocket(`${WS_BASE}/ws/article/${tipe}/${slug}/`);
      ws.onopen = () => {
        console.log("WS connected for article", slug);
      };
      ws.onerror = (err) => {
        console.error("WS error for article", slug, err);
        setAlert({
          type: "danger",
          message: "Realtime connection failed (live updates unavailable).",
        });
      };
      ws.onmessage = (ev) => {
        try {
          const wrapper = JSON.parse(ev.data);
          const msg = wrapper.event ?? wrapper;
          if (!msg || !msg.type) return;
          if (["section_updated", "paragraph_updated"].includes(msg.type)) {
            fetchSections();
          }
        } catch (e) {
          console.error("WS parse", e);
        }
      };
      ws.onclose = () => console.log("WS closed for article", slug);
      wsRef.current = ws;

      return () => {
        wsRef.current?.close();
      };
    }
  }, [slug, tipe, isDiskursus]);

  const navItems = !sections
    ? []
    : sections.map((s) => ({
        id: s.id,
        key: s.section_type.key,
        title: s.section_type?.label || s.section_type?.key,
      }));

  const footnoteNumberMap = buildFootnoteNumberMap(sections);

  const handleParagraphUpdate = (updatedParagraph) => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        paragraphs: (section.paragraphs || []).map((p) =>
          p.id === updatedParagraph.id ? updatedParagraph : p,
        ),
      })),
    );
  };

  return {
    article,
    contributor,
    sections,
    navItems,
    footnoteNumberMap,
    handleParagraphUpdate,
    retryLoadArticle,
  };
}
