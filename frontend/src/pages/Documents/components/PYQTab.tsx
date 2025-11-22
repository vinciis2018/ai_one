import React from 'react';

export const PYQTab: React.FC<{
  pageNumber: number;
  notesDescription: any[];
}> = ({ pageNumber, notesDescription }) => {
  const currentNote = notesDescription?.find((n) => n.page === pageNumber);
  const pyqQuestions = currentNote?.pyq || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Previous Year Questions</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Page {pageNumber}
        </span>
      </div>

      {/* PYQ Content */}
      {pyqQuestions && pyqQuestions.length > 0 ? (
        <div className="space-y-4">
          {pyqQuestions.map((question: any, index: number) => (
            <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-gray-900">{question.question || question}</p>
                  {question.year && (
                    <div className="flex items-center gap-2 text-xs text-purple-600">
                      <i className="fi fi-rr-calendar"></i>
                      <span className="font-medium">{question.year}</span>
                    </div>
                  )}
                  {question.exam && (
                    <div className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {question.exam}
                    </div>
                  )}
                  {question.marks && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Marks:</span> {question.marks}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-dashed border-purple-200">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fi fi-rr-calendar text-purple-400 text-xl"></i>
          </div>
          <p className="text-sm text-gray-500 mb-1">No previous year questions available</p>
          <p className="text-xs text-gray-400">PYQ questions will appear here once added</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex gap-2">
          <i className="fi fi-rr-info text-purple-600 text-sm mt-0.5"></i>
          <div className="flex-1">
            <p className="text-xs text-purple-800 leading-relaxed">
              <strong>Previous Year Questions</strong> help you understand exam patterns and frequently asked topics.
              Practice these to improve your preparation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
