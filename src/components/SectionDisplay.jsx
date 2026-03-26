import React, { useState } from "react";
import ParagraphEditor from "./ParagraphEditor";
import TimelineEntryEditor from "./TimelineEntryEditor";
import "./SectionDisplay.css";

export default function SectionDisplay({
  section,
  articleSlug,
  tipe,
  canEdit,
  isEditMode,
  footnoteNumberMap,
  onParagraphUpdate,
}) {
  const [paragraphs, setParagraphs] = useState(section.paragraphs || []);
  const [timelineEntries, setTimelineEntries] = useState(
    section.timeline_entries || [],
  );

  function handleTimelineEntryUpdate(updatedEntry) {
    setTimelineEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)),
    );
  }

  // Check if this is a timeline section
  const isTimeline = section.is_timeline;

  if (isTimeline) {
    return (
      <div
        className="section-display timeline-section"
        id={`section-${section.section_type.key}`}
      >
        <div className="section-header mb-4">
          <h2 className="text-2xl font-semibold text-orange-600">
            <a name={`section-${section.section_type.key}`}></a>
            {section.section_label ||
              section.section_type?.label ||
              section.section_type?.key}
          </h2>
        </div>

        <div className="timeline-container">
          {timelineEntries.length === 0 && (
            <p className="text-gray-500 italic">
              Belum ada entri lini masa di bagian ini
            </p>
          )}

          {timelineEntries
            .filter((e) => !e.is_deleted)
            .sort((a, b) => a.order - b.order)
            .map((entry, index) => (
              <TimelineEntryEditor
                key={entry.id}
                entry={entry}
                sectionId={section.id}
                articleSlug={articleSlug}
                tipe={tipe}
                canEdit={canEdit}
                isEditMode={isEditMode}
                onUpdate={onParagraphUpdate}
                isFirst={index === 0}
                isLast={index === timelineEntries.length - 1}
                footnoteNumberMap={footnoteNumberMap}
              />
            ))}
        </div>
      </div>
    );
  }

  // Regular section (non-timeline)
  return (
    <div className="section-display" id={`section-${section.section_type.key}`}>
      <div className="section-header mb-0">
        <h2 className="text-2xl font-semibold text-orange-600">
          <a name={`section-${section.section_type.key}`}></a>
          {section.section_label ||
            section.section_type?.label ||
            section.section_type?.key}
        </h2>
        {section.title && <h3 className="text-gray-500">{section.title}</h3>}
      </div>

      <div className="section-paragraphs">
        {paragraphs.length === 0 && (
          <p className="text-gray-500 italic">Belum ada konten di bagian ini</p>
        )}

        {paragraphs
          .filter((p) => !p.is_deleted)
          .sort((a, b) => a.order - b.order)
          .map((paragraph) => (
            <ParagraphEditor
              key={paragraph.id}
              paragraph={paragraph}
              sectionId={section.id}
              articleSlug={articleSlug}
              tipe={tipe}
              canEdit={canEdit}
              isEditMode={isEditMode}
              onUpdate={onParagraphUpdate}
              footnoteNumberMap={footnoteNumberMap}
            />
          ))}
      </div>
    </div>
  );
}
