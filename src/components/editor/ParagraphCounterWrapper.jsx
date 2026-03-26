import React, { useEffect, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import './paragraphCounter.css';

export default function ParagraphCounterWrapper({ editor, maxChars = 560, children }) {
  const [paragraphCounts, setParagraphCounts] = useState([]);

  useEffect(() => {
    if (!editor) return;

    const updateCounters = () => {
      const counts = [];
      
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'paragraph') {
          const charCount = node.textContent.length;
          const remaining = maxChars - charCount;
          
          counts.push({
            pos,
            charCount,
            remaining,
          });
        }
      });
      
      setParagraphCounts(counts);
    };

    // Update on editor changes
    editor.on('update', updateCounters);
    editor.on('selectionUpdate', updateCounters);
    
    // Initial update
    updateCounters();

    return () => {
      editor.off('update', updateCounters);
      editor.off('selectionUpdate', updateCounters);
    };
  }, [editor, maxChars]);

  useEffect(() => {
    if (!editor) return;

    // Add counters to DOM paragraphs
    const editorElement = editor.view.dom;
    const paragraphs = editorElement.querySelectorAll('p');
    
    paragraphs.forEach((p, index) => {
      // Remove existing counter
      const existingCounter = p.querySelector('.paragraph-counter');
      if (existingCounter) {
        existingCounter.remove();
      }

      const count = paragraphCounts[index];
      if (!count) return;

      const { charCount, remaining } = count;

      // Only show counter if paragraph has content
      if (charCount > 0) {
        const counter = document.createElement('div');
        counter.className = 'paragraph-counter';
        counter.contentEditable = 'false';
        
        let colorClass = 'counter-normal';
        if (remaining < 100) colorClass = 'counter-warning';
        if (remaining < 50) colorClass = 'counter-danger';
        if (remaining < 0) colorClass = 'counter-over';
        
        counter.innerHTML = `
          <span className="counter-box ${colorClass}">
            ${remaining}
          </span>
        `;
        
        p.style.position = 'relative';
        p.appendChild(counter);
      }
    });
  }, [editor, paragraphCounts]);

  return children || <EditorContent editor={editor} />;
}

/**
 * Alternative: Use as a hook
 */
export function useParagraphCounter(editor, maxChars = 560) {
  const [counts, setCounts] = useState([]);

  useEffect(() => {
    if (!editor) return;

    const updateCounters = () => {
      const newCounts = [];
      
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'paragraph') {
          const charCount = node.textContent.length;
          const remaining = maxChars - charCount;
          
          newCounts.push({
            pos,
            charCount,
            remaining,
            status: remaining < 0 ? 'over' : remaining < 50 ? 'danger' : remaining < 100 ? 'warning' : 'normal'
          });
        }
      });
      
      setCounts(newCounts);
    };

    editor.on('update', updateCounters);
    editor.on('selectionUpdate', updateCounters);
    updateCounters();

    return () => {
      editor.off('update', updateCounters);
      editor.off('selectionUpdate', updateCounters);
    };
  }, [editor, maxChars]);

  return counts;
}