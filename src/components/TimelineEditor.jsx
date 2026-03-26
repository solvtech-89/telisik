import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { sharedExtensions } from './editor/editorExtension';

function TitleEditor({ value, onChange, maxLength = 60 }) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const currentLength = value ? value.length : 0;
  const placeholderText = "Judul fragmen: Tulis rangkuman kejadian maksimal 60 karakter.";

  useEffect(() => {
    if (editorRef.current) {
      if (!isFocused && !value) {
        editorRef.current.textContent = placeholderText;
      } else if (editorRef.current.textContent !== value && value) {
        editorRef.current.textContent = value;
      }
    }
  }, [value, isFocused, placeholderText]);

  const handleFocus = () => {
    setIsFocused(true);
    if (editorRef.current && editorRef.current.textContent === placeholderText) {
      editorRef.current.textContent = '';
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const text = editorRef.current ? editorRef.current.textContent || '' : '';
    if (!text.trim()) {
      if (editorRef.current) {
        editorRef.current.textContent = placeholderText;
      }
      onChange('');
    }
  };

  const handleInput = (e) => {
    const text = e.currentTarget.textContent || '';
    if (text === placeholderText) return;
    
    if (text.length <= maxLength) {
      onChange(text);
    } else {
      e.currentTarget.textContent = value;
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(e.currentTarget);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const currentText = value || '';
    const newText = currentText + text;
    
    if (newText.length <= maxLength) {
      document.execCommand('insertText', false, text);
    } else {
      const allowedText = text.substring(0, maxLength - currentText.length);
      if (allowedText) {
        document.execCommand('insertText', false, allowedText);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const isPlaceholder = !value && !isFocused;

  return (
    <div style={{ marginBottom: '8px', position: 'relative' }}>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning={true} 
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          width: '100%',
          padding: '8px 0',
          fontSize: '16px',
          fontFamily: 'Inter',
          fontStyle: isPlaceholder ? 'italic' : 'normal',
          fontWeight: '600',
          lineHeight: '24px',
          outline: 'none',
          color: isPlaceholder ? '#878672' : '#555533',
          backgroundColor: 'transparent',
          margin: 0,
          minHeight: '24px',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          borderRadius: '4px'
        }}
      >
        {placeholderText}
      </div>
      <div style={{
        fontSize: '12px',
        color: currentLength > 50 ? '#ef4444' : '#9ca3af',
        textAlign: 'right',
        top: '0px',
        position: 'absolute',
        right: '0px'
      }}>
        {currentLength}/{maxLength}
      </div>
    </div>
  );
}

function ParagraphEditor({ editorId, content, activeEditorId, setActiveEditorId, onEditorChange, onUpdate }) {
  const editor = useEditor({
    extensions: [
      ...sharedExtensions,
      Placeholder.configure({
        placeholder: 'Perincikan kejadiannya'
      })
    ],
    content: content || '',
    editable: activeEditorId === editorId,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editorId, editor.getHTML());
      }
    },
    onFocus: () => {
      setActiveEditorId(editorId);
    },
    onBlur: ({ editor, event }) => {
      setTimeout(() => {
        const relatedTarget = event?.relatedTarget;
        const isToolbarClick = relatedTarget?.closest?.('.enhanced-toolbar') || 
                               relatedTarget?.closest?.('.toolbar-btn') ||
                               relatedTarget?.closest?.('.dropdown-menu') ||
                               relatedTarget?.closest?.('[role="menu"]');
        
        if (isToolbarClick) {
          return;
        }

        if (editor.isEmpty) {
          if (activeEditorId === section.id) {
            setActiveEditorId(null);
          }
        } else {
          setActiveEditorId(null);
        }
      }, 150);
    }
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(activeEditorId === editorId);
      if (activeEditorId === editorId && onEditorChange) {
        onEditorChange(editor);
      }
    }
  }, [activeEditorId, editor, editorId, onEditorChange]);

  const renderUnfocusedContent = () => {
    if (!content) return null;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const paragraphs = tempDiv.querySelectorAll('p');

    return (
      <div style={{ minHeight: '100px', cursor: 'pointer' }} className="prose prose-sm max-w-none">
        {Array.from(paragraphs).map((p, idx) => {
          const charCount = p.textContent.length;
          const remaining = 560 - charCount;
          
          let color = '#3b82f6';
          if (remaining < 100) color = '#f59e0b';
          if (remaining < 50) color = '#ef4444';
          if (remaining < 0) color = '#dc2626';

          return (
            <div key={idx} style={{ position: 'relative', marginBottom: '1em' }}>
              <p dangerouslySetInnerHTML={{ __html: p.innerHTML }} />
              <span style={{
                position: 'absolute',
                right: '8px',
                top: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: color,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                pointerEvents: 'none'
              }}>
                {remaining}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      className="paragraph-wrapper mb-3"
      onClick={() => {
        if (activeEditorId !== editorId) {
          setActiveEditorId(editorId);
          setTimeout(() => {
            editor?.commands.focus();
          }, 0);
        }
      }}
    >
      <div className="paragraph-content">
        {activeEditorId === editorId ? (
          <EditorContent editor={editor} />
        ) : (
          editor && !editor.isEmpty ? (
            renderUnfocusedContent()
          ) : (
            <p style={{minHeight: '60px', color: '#9ca3af', cursor: 'pointer'}}>
              Perincikan kejadiannya
            </p>
          )
        )}
      </div>
    </div>
  );
}

function DateTimePicker({ value, onChange, selectedTimezone }) {
  const inputRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !pickerRef.current) {
      pickerRef.current = flatpickr(inputRef.current, {
        enableTime: true,
        dateFormat: 'd/m/Y H:i',
        time_24hr: true,
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            const date = selectedDates[0];
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            const dateStr = `${year}-${month}-${day}`;
            const timeStr = `${hours}:${minutes}`;
            onChange(dateStr, timeStr);
          }
        }
      });
    }

    return () => {
      if (pickerRef.current) {
        pickerRef.current.destroy();
        pickerRef.current = null;
      }
    };
  }, [onChange]);

  // Update input value when prop changes
  useEffect(() => {
    if (inputRef.current && value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div className="timeline-datetime">
      <Calendar className="me-2" size={32} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Pilih tanggal dan waktu"
        className="form-control datetime-input"
      />
      <span className="timezone-badge ms-2">{selectedTimezone}</span>
    </div>
  );
}

function TimelineEntry({ 
  entry, 
  index, 
  isFirst, 
  isLast, 
  selectedTimezone,
  activeEditorId,
  setActiveEditorId,
  onUpdateEntry,
  onUpdateTitle,
  onUpdateParagraph,
  onAddParagraph,
  onRemoveEntry,
  onEditorChange,
  doAddEntry,
  totalEntries
}) {
  const formatDateTime = (date, time) => {
    if (!date || !time) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year} ${time}`;
  };

  const handleDateTimeChange = (date, time) => {
    onUpdateEntry(entry.id, 'date', date);
    onUpdateEntry(entry.id, 'time', time);
  };

  return (
    <div className="timeline-entry-wrapper">
      <div className="timeline-entry">
        {/* Timeline Marker */}
        <div className="timeline-marker">
          <div className={`timeline-dot ${isFirst ? 'timeline-dot-first' : ''} ${isLast ? 'timeline-dot-last' : ''}`}>
            {isFirst && (
              <svg className="triangle-icon" width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16L0.339746 1L17.6603 1L9 16Z" stroke="#dc3545" strokeWidth="2" fill="none"/>
              </svg>
            )}
          </div>
          {!isLast && <div className="timeline-line"></div>}
        </div>

        {/* Entry Content */}
        <div className="timeline-content">
          {/* Date/Time Input */}
          <div className="timeline-header mb-2">
            <DateTimePicker
              value={formatDateTime(entry.date, entry.time)}
              onChange={handleDateTimeChange}
              selectedTimezone={selectedTimezone}
            />
          </div>

          {/* Title Input */}
          <h3 className="timeline-title mb-3">
            <TitleEditor 
              value={entry.title}
              onChange={(value) => onUpdateTitle(entry.id, value)}
              maxLength={60}
            />
          </h3>

          {/* Paragraphs */}
          <div className="timeline-paragraphs">
            {entry.paragraphs.map((paragraph) => (
              <ParagraphEditor
                key={paragraph.editorId}
                editorId={paragraph.editorId}
                content={paragraph.content}
                activeEditorId={activeEditorId}
                setActiveEditorId={setActiveEditorId}
                onEditorChange={onEditorChange}
                onUpdate={(editorId, html) => onUpdateParagraph(entry.id, editorId, html)}
              />
            ))}
          </div>

          {/* Add Fragment & Delete Entry Buttons */}
          <div className="mt-3 timeline-actions">
            {isLast && (
            <button
                onClick={doAddEntry}
                className="btn btn-sm rounded-pill btn-tambah-peristiwa"
            >
                + Fragmen
            </button>
            )}
            {totalEntries > 1 && (
              <button
                onClick={() => onRemoveEntry(entry.id)}
                className="btn-hapus-entry rounded-pill btn-sm btn"
              >
                <Trash2 size={14} className='me-2' />
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineEditor({ onEditorFocus, activeEditorId, setActiveEditorId, onEditorChange, sectiontitle, sectionKey, onTimelineDataChange }) {
  const [selectedTimezone, setSelectedTimezone] = useState('WIB');
  const [introContent, setIntroContent] = useState('');
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: '',
      time: '',
      timezone: 'WIB',
      title: '',
      paragraphs: [{ id: 1, editorId: 'timeline-1-p-1', content: '' }]
    }
  ]);
  
  const introEditor = useEditor({
    extensions: [
      ...sharedExtensions,
      Placeholder.configure({
        placeholder: 'Tulis pengantar kronologi, 1 paragraf saja'
      })
    ],
    content: introContent || '',
    editable: activeEditorId === 'timeline-intro',
    onUpdate: ({ editor }) => {
      setIntroContent(editor.getHTML());
    },
    onFocus: () => {
      setActiveEditorId('timeline-intro');
    }
  });

  useEffect(() => {
    if (introEditor) {
      introEditor.setEditable(activeEditorId === 'timeline-intro');
      if (activeEditorId === 'timeline-intro' && onEditorChange) {
        onEditorChange(introEditor);
      }
    }
  }, [activeEditorId, introEditor, onEditorChange]);

  const renderIntroUnfocused = () => {
    if (!introContent) return null;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = introContent;
    const paragraphs = tempDiv.querySelectorAll('p');

    return (
      <div style={{ minHeight: '100px', cursor: 'pointer' }} className="prose prose-sm max-w-none">
        {Array.from(paragraphs).map((p, idx) => {
          const charCount = p.textContent.length;
          const remaining = 560 - charCount;
          
          let color = '#3b82f6';
          if (remaining < 100) color = '#f59e0b';
          if (remaining < 50) color = '#ef4444';
          if (remaining < 0) color = '#dc2626';

          return (
            <div key={idx} style={{ position: 'relative', marginBottom: '1em' }}>
              <p dangerouslySetInnerHTML={{ __html: p.innerHTML }} />
              <span style={{
                position: 'absolute',
                right: '8px',
                top: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: color,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                pointerEvents: 'none'
              }}>
                {remaining}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const addEntry = () => {
    const newEntryId = Date.now();
    const newEntry = {
      id: newEntryId,
      date: '',
      time: '',
      timezone: selectedTimezone,
      title: '',
      paragraphs: [{ id: 1, editorId: `timeline-${newEntryId}-p-1`, content: '' }]
    };
    setEntries([...entries, newEntry]);
  };

  const removeEntry = (entryId) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== entryId));
    }
  };

  const addParagraph = (entryId) => {
    setEntries(entries.map(entry => {
      if (entry.id === entryId) {
        const newParagraphId = Date.now();
        return {
          ...entry,
          paragraphs: [
            ...entry.paragraphs,
            { id: newParagraphId, editorId: `timeline-${entryId}-p-${newParagraphId}`, content: '' }
          ]
        };
      }
      return entry;
    }));
  };

  const updateParagraph = (entryId, editorId, content) => {
    setEntries(entries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          paragraphs: entry.paragraphs.map(p => 
            p.editorId === editorId ? { ...p, content } : p
          )
        };
      }
      return entry;
    }));
  };

  const updateEntry = (entryId, field, value) => {
    setEntries(entries.map(entry => 
      entry.id === entryId ? { ...entry, [field]: value } : entry
    ));
  };

  const updateEntryTitle = (entryId, value) => {
    setEntries(entries.map(entry => 
      entry.id === entryId ? { ...entry, title: value } : entry
    ));
  };

  useEffect(() => {
    if (onTimelineDataChange) {
        onTimelineDataChange({
        introContent,
        selectedTimezone,
        entries
        });
    }
  }, [introContent, selectedTimezone, entries, onTimelineDataChange]);

  return (
    <div className="timeline-editor-container">
      <div className="timeline-intro-section" id={`section-${sectionKey}`}>
        <h2 className="timeline-section-title" style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#FC6736',
                  marginBottom: '8px',
                  marginTop: '24px'
                }}>
                  {sectiontitle}
                </h2><a name={`section-${sectionKey}`}></a>
        <div 
          className="timeline-intro-editor"
          onClick={() => {
            if (activeEditorId !== 'timeline-intro') {
              setActiveEditorId('timeline-intro');
              setTimeout(() => {
                introEditor?.commands.focus();
              }, 0);
            }
          }}
        >
          {activeEditorId === 'timeline-intro' ? (
            <EditorContent editor={introEditor} />
          ) : (
            introEditor && !introEditor.isEmpty ? (
              renderIntroUnfocused()
            ) : (
              <p style={{minHeight: '100px', color: '#9ca3af', cursor: 'pointer'}}>
                Tulis pengantar kronologi, 1 paragraf saja
              </p>
            )
          )}
        </div>
        
        <div className="timezone-selector d-flex mb-3">
            <div className="timezone-label me-3">Zona Waktu:</div>
            <div>
                <div>
                    <label className="timezone-option form-check form-switch form-check-inline">
                        <input 
                        type="radio" 
                        name="timezone" 
                        value="WIB"
                        className="form-check-input"
                        checked={selectedTimezone === 'WIB'}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        />
                        <span className="form-check-label">WIB</span>
                    </label>
                    <label className="timezone-option form-check form-switch form-check-inline">
                        <input 
                        type="radio" 
                        name="timezone" 
                        value="WITA"
                        className="form-check-input"
                        checked={selectedTimezone === 'WITA'}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        />
                        <span className="form-check-label">WITA</span>
                    </label>
                    <label className="timezone-option form-check form-switch form-check-inline">
                        <input 
                        type="radio" 
                        name="timezone" 
                        value="WIT"
                        className="form-check-input"
                        checked={selectedTimezone === 'WIT'}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        />
                        <span className="form-check-label">WIT</span>
                    </label>
                </div>                
            </div> 
        </div>
      </div>

      {/* Timeline Entries */}
      <div className="timeline-container">
        {entries.map((entry, index) => (
          <TimelineEntry
            key={entry.id}
            entry={entry}
            index={index}
            isFirst={index === 0}
            isLast={index === entries.length - 1}
            selectedTimezone={selectedTimezone}
            activeEditorId={activeEditorId}
            setActiveEditorId={setActiveEditorId}
            onUpdateEntry={updateEntry}
            onUpdateTitle={updateEntryTitle}
            onUpdateParagraph={updateParagraph}
            onAddParagraph={addParagraph}
            onRemoveEntry={removeEntry}
            onEditorChange={onEditorChange}
            doAddEntry={addEntry}
            totalEntries={entries.length}
          />
        ))}
      </div>
    </div>
  );
}

export default TimelineEditor;