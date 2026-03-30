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
      } lg:col-span-1 lg:col-start-2 h-full min-h-0 border-x border-[#e2e0d8] bg-[#faf8f1] px-5 py-5 ${
        !isMobile ? "overflow-y-scroll" : ""
      }`}
    >
      <div className="mt-2 mb-3">
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
        />
      </div>
      <TitleEditor
        value={title}
        onChange={setTitle}
        articleType={articleType}
      />

      <ExcerptEditor value={excerpt} onChange={setExcerpt} />
      <EditorHintBox>
        Lead sebaiknya berupa{" "}
        <span className="text-blue-600">
          rangkuman isi tulisan sekaligus penggugah minat
        </span>{" "}
        agar pembaca lanjut menelaah paparan—maksimal 155 karakter termasuk
        spasi.
      </EditorHintBox>
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
              <div id={section.key}>
                <h2 className="mb-2 text-2xl font-semibold text-telisik">
                  {section.title}
                </h2>

                <EditorHintBox className="mt-2">
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
              <hr className="my-5 border-gray-200" />
            </React.Fragment>
          ),
        )
      )}
      {!isDiskursus && (
        <ActorInterestManager actors={actors} setActors={setActors} />
      )}
      <FootnotesList footnotes={orderedFootnotes} />
    </div>
  );
}
