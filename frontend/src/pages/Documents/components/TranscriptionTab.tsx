import React from "react";
import { Reorder } from "framer-motion";
import { SentenceItem } from "./SentenceItem";

interface TranscriptionTabProps {
  pageNumber: number;
  selectedDocument: any;
  notesDescription: any[];
  sentences: string[];
  updateTranscriptionFromSentences: (newSentences: string[]) => void;
  handleTranscribe: () => void;
  transcriptionStatus: string;
}

export const TranscriptionTab: React.FC<TranscriptionTabProps> = ({
  pageNumber,
  selectedDocument,
  notesDescription,
  sentences,
  updateTranscriptionFromSentences,
  handleTranscribe,
  transcriptionStatus,
}) => {
  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Page {pageNumber} Content</h3>
        <button
          onClick={handleTranscribe}
          disabled={transcriptionStatus === 'loading'}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Transcription"
        >
          {transcriptionStatus === 'loading' ? (
            <i className="fi fi-br-circle animate-spin text-xs"></i>
          ) : (
            <i className="fi fi-rr-refresh"></i>
          )}
        </button>
      </div>

      {/* Editable List */}
      {selectedDocument && notesDescription.find((note: any) => note.page === pageNumber && note.transcription) ? (
        <div className="flex-1 overflow-y-auto p-3 rounded-xl border bg-gray-50/50 border-gray-200">
          <Reorder.Group axis="y" values={sentences} onReorder={updateTranscriptionFromSentences} className="space-y-2">
            {sentences.map((sentence, sIndex) => (
              <SentenceItem
                key={sIndex}
                sentence={sentence}
                index={sIndex}
                updateTranscription={updateTranscriptionFromSentences}
                sentences={sentences}
              />
            ))}
          </Reorder.Group>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl p-6">
          <i className="fi fi-rr-document-signed text-4xl mb-2 opacity-20"></i>
          <p className="text-sm">No transcription for this page.</p>
          <button
            onClick={handleTranscribe}
            className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            Transcribe Now
          </button>
        </div>
      )}
    </div>
  );
};
