import React from "react";
import ReactMarkdown from 'react-markdown';

interface NotesTabProps {
  pageNumber: number;
  notesDescription: any[];
  generateNotesData: any;
  generateNotesStatus: string;
  handleGenerateNotes: () => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  pageNumber,
  notesDescription,
  generateNotesData,
  generateNotesStatus,
  handleGenerateNotes,
}) => {
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

      {generateNotesStatus === 'succeeded' && generateNotesData?.notes?.length > 0 ? (
        <div className="flex-1 overflow-y-auto p-4 rounded-xl border bg-orange-50/30 border-orange-100">
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            {generateNotesData.notes.map((note: any, i: number) => (
              <li key={i} className="leading-relaxed">{note}</li>
            ))}
          </ul>
        </div>
      ) : notesDescription.find(n => n.page === pageNumber)?.notes ? (
        <div className="flex-1 overflow-y-auto p-4 rounded-xl border bg-orange-50/30 border-orange-100">
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>
              {notesDescription.find(n => n.page === pageNumber)?.notes || ''}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl p-6">
          <i className="fi fi-rr-magic-wand text-4xl mb-2 opacity-20"></i>
          <p className="text-sm">No notes generated yet.</p>
          <button
            onClick={handleGenerateNotes}
            className="mt-4 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors"
          >
            Generate Notes
          </button>
        </div>
      )}
    </div>
  );
};
