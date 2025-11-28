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
            <li key={i} className="leading-relaxed">{note}</li>
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
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">AI Generated Notes</h3>
        <button
          onClick={handleGenerateNotes}
          disabled={generateNotesStatus === 'loading'}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Notes"
        >
          {generateNotesStatus === 'loading' ? (
            <i className="fi fi-br-circle animate-spin text-xs"></i>
          ) : (
            <i className="fi fi-rr-refresh"></i>
          )}
        </button>
      </div>

      {hasNotes ? (
        <div className="flex-1 overflow-y-auto p-4 rounded-xl border bg-orange-50/30 border-orange-100">
          {renderNotes()}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl p-6">
          <i className="fi fi-rr-magic-wand text-4xl mb-2 opacity-20"></i>
          <p className="text-sm">No notes generated yet.</p>
          <button
            onClick={handleGenerateNotes}
            disabled={generateNotesStatus === 'loading'}
            className="mt-4 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            {generateNotesStatus === 'loading' ? 'Generating...' : 'Generate Notes'}
          </button>
        </div>
      )}
    </div>
  );
};
