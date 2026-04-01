import React from "react";
import ActorInterestManager from "./ActorInterestManager";
import ArticleSectionEditor from "./ArticleSectionEditor";
import DiskursusContentEditor from "./DiskursusContentEditor";
import EditorHintBox from "./EditorHintBox";
import ExcerptEditor from "./ExcerptEditor";
import FootnotesList from "./FootnotesList";
import TimelineEditor from "./TimelineEditor";
import TitleEditor from "./TitleEditor";
import { Alert } from "./ui";

/* Ikon dekoratif untuk section header */
const SectionDot = () => (
  <span
    style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "#ef5f2f",
      marginRight: "0.45rem",
      verticalAlign: "middle",
      flexShrink: 0,
    }}
  />
);

export default function ArticleEditorMiddleColumn({
  articleType,
  collapsed,
  isMobile,
  alert,
  setAlert,
  title,
  setTitle,
  excerpt,
  setExcerpt,
  diskursusContent,
  setDiskursusContent,
  setDiskursusEditor,
  footnoteMap,
  activeEditorId,
  setActiveEditorId,
  sections,
  isTimelineSection,
  setTimelineEditor,
  setTimelineData,
  setActiveEditor,
  sectionContents,
  handleSectionUpdate,
  setSectionEditor,
  actors,
  setActors,
  orderedFootnotes,
}) {
  const isDiskursus = articleType === "DISKURSUS";

  return (
    <div
      id="middle-col-scroll"
      className={`editor-main-column col-span-1 ${
        isDiskursus
          ? "md:col-span-7"
          : collapsed
            ? "md:col-span-8"
            : "md:col-span-7"
      } lg:col-span-1 lg:col-start-2 h-full min-h-0 border-x border-[#e2dfd4] bg-[#F9F6EF] px-5 py-5 ${
        !isMobile ? "overflow-y-scroll" : ""
      }`}
    >
      {/* Alert */}
      <div className="mt-1 mb-3">
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
        />
      </div>

      {/* Judul artikel */}
      <TitleEditor
        value={title}
        onChange={setTitle}
        articleType={articleType}
      />

      {/* Lead / Excerpt */}
      <ExcerptEditor value={excerpt} onChange={setExcerpt} />

      {/* Hint lead */}
      <EditorHintBox>
        Lead sebaiknya berupa{" "}
        <span className="text-blue-600">
          rangkuman isi tulisan sekaligus penggugah minat
        </span>{" "}
        agar pembaca lanjut menelaah paparan—maksimal 155 karakter termasuk
        spasi.
      </EditorHintBox>

      {/* ── Konten Diskursus ─────────────────────────────── */}
      {isDiskursus ? (
        <>
          <DiskursusContentEditor
            content={diskursusContent}
            onUpdate={setDiskursusContent}
            onEditorChange={setDiskursusEditor}
            footnoteMap={footnoteMap}
            activeEditorId={activeEditorId}
            setActiveEditorId={setActiveEditorId}
          />

          <EditorHintBox className="mt-4">
            Manfaatkan <span className="text-blue-600">styling tools</span>{" "}
            (bold, italic, numbering, footnote, dsb.) Tiap paragraf maksimal 560
            karakter termasuk spasi; Melebihi itu, kursor otomatis turun membuat
            alinea baru.
          </EditorHintBox>
        </>
      ) : (
        /* ── Sections (Kronik / Tilik) ─────────────────── */
        sections.map((section) =>
          isTimelineSection(section.key) ? (
            <TimelineEditor
              key={section.id}
              activeEditorId={activeEditorId}
              setActiveEditorId={setActiveEditorId}
              onEditorChange={setTimelineEditor}
              sectiontitle={section.title}
              sectionKey={section.key}
              onTimelineDataChange={setTimelineData}
            />
          ) : (
            <React.Fragment key={section.id}>
              <div id={section.key} className="section-block">
                {/* Section heading — sesuai gaya artikel published */}
                <h2
                  className="editor-section-heading flex items-center gap-1 mb-2"
                  style={{
                    color: "#ef5f2f",
                    fontWeight: 700,
                    fontSize: "1.7rem",
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                  }}
                >
                  <SectionDot />
                  {section.title}
                </h2>

                <EditorHintBox className="mt-1 mb-2">
                  Manfaatkan{" "}
                  <span className="text-blue-600">styling tools</span> (bold,
                  italic, numbering, footnote, dsb.) Tiap paragraf maksimal 560
                  karakter termasuk spasi; Melebihi itu, kursor otomatis turun
                  membuat alinea baru.
                </EditorHintBox>

                <ArticleSectionEditor
                  section={section}
                  sectionContent={sectionContents[section.id]}
                  activeEditorId={activeEditorId}
                  setActiveEditorId={setActiveEditorId}
                  setActiveEditor={setActiveEditor}
                  onUpdate={handleSectionUpdate}
                  onEditorChange={setSectionEditor}
                  footnoteMap={footnoteMap}
                />
              </div>

              {/* Divider antar section — sesuai gambar referensi */}
              <hr
                className="section-divider"
                style={{
                  border: "none",
                  borderTop: "1px solid #dfd7c7",
                  margin: "1.25rem 0",
                }}
              />
            </React.Fragment>
          ),
        )
      )}

      {/* ── Actor Interest Manager ────────────────────────── */}
      {!isDiskursus && (
        <ActorInterestManager actors={actors} setActors={setActors} />
      )}

      {/* ── Footnotes ─────────────────────────────────────── */}
      <FootnotesList footnotes={orderedFootnotes} />
    </div>
  );
}
