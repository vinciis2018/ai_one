import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface NotesTabProps {
  pageNumber: number;
  notesDescription: any[];
  generateNotesStatus: string;
  handleGenerateNotes: () => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  pageNumber,
  notesDescription,
  generateNotesStatus,
  handleGenerateNotes,
}) => {
  // Get notes from notesDescription for current page
  const currentPageNotes = notesDescription.find(n => n.page === pageNumber)?.notes;

  // Determine if we have notes to display
  const hasNotes = currentPageNotes && (
    (typeof currentPageNotes === 'string' && currentPageNotes.trim().length > 0) ||
    (Array.isArray(currentPageNotes) && currentPageNotes.length > 0)
  );


  // Render notes content based on type
  const renderNotes = () => {
    if (!currentPageNotes) return null;

    // If notes is an array of strings
    if (Array.isArray(currentPageNotes)) {
      return (
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          {currentPageNotes.map((note: any, i: number) => (
            <li key={i} className="leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {note}
              </ReactMarkdown>
            </li>
          ))}
        </ul>
      );
    }

    // If notes is a string (markdown or plain text)
    if (typeof currentPageNotes === 'string') {
      return (
        <div className="prose prose-sm max-w-none text-gray-700">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {currentPageNotes}
          </ReactMarkdown>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200 shrink-0">
        <h3 className="text-sm font-semibold text-gray-700">Quick Notes</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateNotes}
            disabled={generateNotesStatus === 'loading'}
            className="px-3 py-2 flex items-center gap-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 hover:border-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
          >
            {generateNotesStatus === 'loading' ? (
              <>
                <i className="fi fi-br-circle flex items-center justify-center animate-spin text-xs"></i>
              </>
            ) : (
              <>
                <i className="fi fi-rr-refresh flex items-center justify-center"></i>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {hasNotes ? (
          <div className="flex-1 overflow-y-auto rounded-xl">
            {renderNotes()}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-dashed border-orange-200">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fi fi-rr-journal-alt flex items-center justify-center text-orange-300 text-xl"></i>
            </div>
            <p className="text-sm font-medium mb-1">No notes generated yet</p>
            <p className="text-xs text-gray-400 mb-4">Click below to generate comprehensive notes</p>
            
            <button
              onClick={handleGenerateNotes}
              disabled={generateNotesStatus === 'loading'}
              className="px-4 py-2 bg-gradient-to-br from-orange-200 to-amber-300 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            >
              {generateNotesStatus === 'loading' ? (
                <>
                  <i className="fi fi-br-circle animate-spin mr-2"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fi fi-sr-select flex items-center justify-center"></i> 
                  Generate Notes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
