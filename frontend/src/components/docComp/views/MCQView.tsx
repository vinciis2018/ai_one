import React from 'react';

interface MCQViewProps {
  pageNumber: number;
  noteForPage: any;
  onBack: () => void;
}

export const MCQView: React.FC<MCQViewProps> = ({ pageNumber, noteForPage, onBack }) => {
  const mcq = noteForPage?.mcq;

  return (
    <div className="h-full w-full bg-white overflow-y-auto p-3 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-logoPink to-logoPurple rounded-xl flex items-center justify-center shadow-lg">
              <i className="fi fi-sr-quiz-alt flex items-center justify-center text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-base lg:text-xl font-bold text-slate-900">Multiple Choice</h2>
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
        {mcq && (mcq.easy?.length > 0 || mcq.medium?.length > 0 || mcq.hard?.length > 0) ? (
          <div className="space-y-8">
            {mcq.easy && mcq.easy.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                  <i className="fi fi-rr-grin-stars flex items-center justify-center" />
                  Easy Questions
                </h3>
                <div className="space-y-4">
                  {mcq.easy.map((q: any, i: number) => (
                    <div key={i} className="bg-white border border-green-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-sm font-semibold text-slate-900 mb-4">{i + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 lg:pl-4">
                        {q.options?.map((opt: string, j: number) => (
                          <div key={j} className={`text-sm p-3 rounded-xl border ${opt === q.answer ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                            <span className="mr-2 opacity-60">{String.fromCharCode(65 + j)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-green-600 mt-4 font-bold flex items-start gap-1">
                        <i className="fi fi-rr-check-circle flex items-center" />
                        Answer: {q.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mcq.medium && mcq.medium.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-yellow-600 mb-3 flex items-center gap-2">
                  <i className="fi fi-rr-smile flex items-center justify-center" />
                  Medium Questions
                </h3>
                <div className="space-y-4">
                  {mcq.medium.map((q: any, i: number) => (
                    <div key={i} className="bg-white border border-yellow-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-sm font-bold text-slate-900 mb-4">{i + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                        {q.options?.map((opt: string, j: number) => (
                          <div key={j} className={`text-sm p-3 rounded-xl border ${opt === q.answer ? 'bg-yellow-50 border-yellow-200 text-yellow-800 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                            <span className="mr-2 opacity-60">{String.fromCharCode(65 + j)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-yellow-600 mt-4 font-bold flex items-start gap-1">
                        <i className="fi fi-rr-check-circle flex items-center" />
                        Answer: {q.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mcq.hard && mcq.hard.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
                  <i className="fi fi-rr-surprise flex items-center justify-center" />
                  Hard Questions
                </h3>
                <div className="space-y-4">
                  {mcq.hard.map((q: any, i: number) => (
                    <div key={i} className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-sm font-bold text-slate-900 mb-4">{i + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                        {q.options?.map((opt: string, j: number) => (
                          <div key={j} className={`text-sm p-3 rounded-xl border ${opt === q.answer ? 'bg-red-50 border-red-200 text-red-800 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                            <span className="mr-2 opacity-60">{String.fromCharCode(65 + j)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-red-600 mt-4 font-bold flex items-start gap-1">
                        <i className="fi fi-rr-check-circle flex items-center" />
                        Answer: {q.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fi fi-rr-checkbox text-3xl text-slate-300"></i>
            </div>
            <p className="text-slate-500 font-medium">No MCQ questions available</p>
          </div>
        )}
      </div>
    </div>
  );
};
