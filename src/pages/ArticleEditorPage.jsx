import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarNav from "../components/SidebarNav";
import { useAuth } from "../AuthContext";
import ArticleEditorHeader from "../components/ArticleEditorHeader";
import ArticleEditorMiddleColumn from "../components/ArticleEditorMiddleColumn";
import ArticleEditorRightColumn from "../components/ArticleEditorRightColumn";
import ArticleEditorModals from "../components/ArticleEditorModals";
import { useArticleEditorPublishing } from "../hooks/useArticleEditorPublishing";
import { useArticleEditorFootnotes } from "../hooks/useArticleEditorFootnotes";
import { useArticleEditorState } from "../hooks/useArticleEditorState";
import { useIsMobile } from "../hooks/useIsMobile";
import { isTimelineSection } from "../utils/articleEditorSections";
import {
  buildArticlePayload,
} from "../utils/articleEditorPayload";
import "./ArticleEditorPage.css";

export default function KronikTilikEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tipe = "kronik" } = useParams();

  const isMobile = useIsMobile();

  const {
    articleType,
    title,
    setTitle,
    excerpt,
    setExcerpt,
    collapsed,
    setCollapsed,
    activeEditorId,
    setActiveEditorId,
    activeEditor,
    setActiveEditor,
    timelineEditor,
    setTimelineEditor,
    sectionEditor,
    setSectionEditor,
    footnoteMap,
    images,
    setImages,
    timelineData,
    setTimelineData,
    alert,
    setAlert,
    focusImageIndex,
    setFocusImageIndex,
    contentType,
    setContentType,
    bookTitle,
    setBookTitle,
    bookAuthor,
    setBookAuthor,
    bookPublisher,
    setBookPublisher,
    bookYear,
    setBookYear,
    diskursusContent,
    setDiskursusContent,
    diskursusEditor,
    setDiskursusEditor,
    category,
    setCategory,
    actors,
    setActors,
    locationData,
    setLocationData,
    sections,
    sectionContents,
    currentEditor,
    navItems,
    handleSectionUpdate,
  } = useArticleEditorState({ tipe, user, navigate });

  const {
    footnotes,
    orderedFootnotes,
    showFootnoteModal,
    footnoteText,
    setFootnoteText,
    closeFootnoteModal,
    handleAddFootnote,
    handleFootnoteSubmit,
  } = useArticleEditorFootnotes({
    currentEditor,
    footnoteMap,
    setAlert,
  });

  const {
    savedArticleId,
    showSaveDraftModal,
    setShowSaveDraftModal,
    showSaveSuccessModal,
    setShowSaveSuccessModal,
    showPublishModal,
    setShowPublishModal,
    showPublishSuccessModal,
    setShowPublishSuccessModal,
    isSaving,
    isPublishing,
    handleSaveDraftClick,
    handleConfirmSaveDraft,
    handlePublishClick,
    handleConfirmPublish,
  } = useArticleEditorPublishing({
    images,
    createArticleData: () =>
      buildArticlePayload({
        articleType,
        title,
        excerpt,
        contentType,
        bookTitle,
        bookAuthor,
        bookPublisher,
        bookYear,
        diskursusContent,
        footnotes,
        images,
        category,
        actors,
        locationData,
        sections,
        sectionContents,
        timelineData,
      }),
    setAlert,
    setFocusImageIndex,
  });

  return (
    <div className="flex h-screen flex-col">
      <ArticleEditorHeader
        currentEditor={currentEditor}
        onAddFootnote={handleAddFootnote}
        onSaveDraft={handleSaveDraftClick}
        onPublish={handlePublishClick}
      />

      <div className="h-[calc(100vh-80px)] flex-1">
        <div className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full">
            <div
              className={
                collapsed
                  ? "hidden md:block md:col-auto md:w-[52px] border-r h-full"
                  : "hidden md:block md:col-span-2 border-r h-full pb-5"
              }
            >
              <SidebarNav
                articleTOC={navItems}
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
              />
            </div>

            <ArticleEditorMiddleColumn
              articleType={articleType}
              collapsed={collapsed}
              isMobile={isMobile}
              alert={alert}
              setAlert={setAlert}
              title={title}
              setTitle={setTitle}
              excerpt={excerpt}
              setExcerpt={setExcerpt}
              diskursusContent={diskursusContent}
              setDiskursusContent={setDiskursusContent}
              setDiskursusEditor={setDiskursusEditor}
              footnoteMap={footnoteMap}
              activeEditorId={activeEditorId}
              setActiveEditorId={setActiveEditorId}
              sections={sections}
              isTimelineSection={isTimelineSection}
              setTimelineEditor={setTimelineEditor}
              setTimelineData={setTimelineData}
              setActiveEditor={setActiveEditor}
              sectionContents={sectionContents}
              handleSectionUpdate={handleSectionUpdate}
              setSectionEditor={setSectionEditor}
              actors={actors}
              setActors={setActors}
              orderedFootnotes={orderedFootnotes}
            />

            <ArticleEditorRightColumn
              articleType={articleType}
              collapsed={collapsed}
              contentType={contentType}
              setContentType={setContentType}
              bookTitle={bookTitle}
              setBookTitle={setBookTitle}
              bookAuthor={bookAuthor}
              setBookAuthor={setBookAuthor}
              bookPublisher={bookPublisher}
              setBookPublisher={setBookPublisher}
              bookYear={bookYear}
              setBookYear={setBookYear}
              category={category}
              setCategory={setCategory}
              locationData={locationData}
              setLocationData={setLocationData}
              setImages={setImages}
              images={images}
              focusImageIndex={focusImageIndex}
              onFocusComplete={() => setFocusImageIndex(null)}
            />
          </div>
        </div>
      </div>
      <ArticleEditorModals
        showFootnoteModal={showFootnoteModal}
        footnoteText={footnoteText}
        setFootnoteText={setFootnoteText}
        closeFootnoteModal={closeFootnoteModal}
        handleFootnoteSubmit={handleFootnoteSubmit}
        showSaveDraftModal={showSaveDraftModal}
        setShowSaveDraftModal={setShowSaveDraftModal}
        isSaving={isSaving}
        handleConfirmSaveDraft={handleConfirmSaveDraft}
        showSaveSuccessModal={showSaveSuccessModal}
        setShowSaveSuccessModal={setShowSaveSuccessModal}
        showPublishModal={showPublishModal}
        setShowPublishModal={setShowPublishModal}
        isPublishing={isPublishing}
        handleConfirmPublish={handleConfirmPublish}
        showPublishSuccessModal={showPublishSuccessModal}
        setShowPublishSuccessModal={setShowPublishSuccessModal}
        savedArticleId={savedArticleId}
      />
    </div>
  );
}
