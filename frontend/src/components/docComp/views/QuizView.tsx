import React from 'react';

interface QuizViewProps {
  pageNumber: number;
  noteForPage: any;
  onBack: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ pageNumber, noteForPage, onBack }) => {
  const quiz = noteForPage?.quiz;

  return (
    <div className="h-full w-full bg-white overflow-y-auto p-3 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-logoPink to-logoPurple rounded-xl flex items-center justify-center shadow-lg">
              <i className="fi fi-sr-test text-white flex items-center justify-center text-lg"></i>
            </div>
            <div>
              <h2 className="text-base lg:text-xl font-bold text-slate-900">Quiz Questions</h2>
              <p className="text-xs lg:text-sm text-slate-500 font-medium">Page {pageNumber}</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors flex items-center gap-2"
          >
            <i className="fi fi-rr-arrow-left flex items-center justify-center text-xs"></i>
            <span className="hidden lg:block">Back to PDF</span>
          </button>
        </div>
        {quiz && (quiz.easy?.length > 0 || quiz.medium?.length > 0 || quiz.hard?.length > 0) ? (
          <div className="space-y-6">
            {quiz.easy && quiz.easy.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                  <i className="fi fi-rr-grin-stars flex items-center justify-center" />
                  Easy Questions
                </h3>
                <div className="space-y-3">
                  {quiz.easy.map((q: string, i: number) => (
                    <div key={i} className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-sm font-semibold text-slate-800">{i + 1}. {q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {quiz.medium && quiz.medium.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-yellow-600 mb-3 flex items-center gap-2">
                  <i className="fi fi-rr-smile flex items-center justify-center" />
                  Medium Questions
                </h3>
                <div className="space-y-3">
                  {quiz.medium.map((q: string, i: number) => (
                    <div key={i} className="bg-white border border-yellow-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-sm font-semibold text-slate-800">{i + 1}. {q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {quiz.hard && quiz.hard.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
                  <i className="fi fi-rr-surprise flex items-center justify-center" />
                  Hard Questions
                </h3>
                <div className="space-y-3">
                  {quiz.hard.map((q: string, i: number) => (
                    <div key={i} className="bg-white border border-red-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-sm font-semibold text-slate-800">{i + 1}. {q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fi fi-rr-list-check text-3xl text-slate-300"></i>
            </div>
            <p className="text-slate-500 font-medium">No quiz questions available</p>
          </div>
        )}
      </div>
    </div>
  );
};
