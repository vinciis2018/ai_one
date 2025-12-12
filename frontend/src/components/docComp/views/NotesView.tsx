import React from 'react';
import ReactMarkdown from 'react-markdown';

interface NotesViewProps {
  pageNumber: number;
  noteForPage: any;
  onBack: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ pageNumber, noteForPage, onBack }) => {
  return (
    <div className="h-full w-full bg-white overflow-y-auto p-3 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-logoPink to-logoPurple rounded-xl flex items-center justify-center shadow-lg">
              <i className="fi fi-sr-journal-alt flex items-center justify-center text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-base lg:text-xl font-bold text-slate-900">Notes</h2>
              <p className="text-xs lg:text-sm text-slate-500 font-medium">Page {pageNumber}</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors flex items-center gap-2 shadow-sm"
          >
            <i className="fi fi-rr-arrow-left flex items-center justify-center text-xs"></i>
            <span className="hidden lg:block">Back to PDF</span>
          </button>
        </div>
        {noteForPage?.notes ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-3 lg:p-6">
              <div className="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-900 prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:text-slate-900">
                <ReactMarkdown>
                  {noteForPage.notes}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fi fi-rr-magic-wand text-3xl text-slate-300"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Notes Available</h3>
            <p className="text-slate-500 text-sm font-medium">Notes haven't been generated for this page yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
