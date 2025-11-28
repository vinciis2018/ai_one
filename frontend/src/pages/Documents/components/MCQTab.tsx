import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';


interface MCQTabProps {
  pageNumber: number;
  notesDescription: any[];
  mcqData: any;
  mcqStatus: string;
  handleGenerateMCQ: () => void;
}

export const MCQTab: React.FC<MCQTabProps> = ({
  pageNumber,
  notesDescription,
  mcqData,
  mcqStatus,
  handleGenerateMCQ,
}) => {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Multiple Choice Questions</h3>
        <button
          onClick={handleGenerateMCQ}
          disabled={mcqStatus === 'loading'}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh MCQ"
        >
          {mcqStatus === 'loading' ? (
            <i className="fi fi-br-circle animate-spin text-xs"></i>
          ) : (
            <i className="fi fi-rr-refresh"></i>
          )}
        </button>
      </div>

      {mcqStatus === 'succeeded' && mcqData?.questions?.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-3">
          {mcqData.questions.map((q: any, i: number) => (
            <div key={i} className="p-4 rounded-xl border bg-white border-gray-200 shadow-sm">
              {/* <p className="text-sm text-gray-800 font-medium mb-2">{q.question}</p> */}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {q.question}
                </ReactMarkdown>
              <ul className="space-y-1 pl-4 list-disc">
                {q.options?.map((opt: string, optIndex: number) => (
                  <li key={optIndex} className={opt === q.answer ? "text-indigo-700 font-semibold" : "text-gray-600"}>
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : notesDescription.find(n => n.page === pageNumber)?.mcq ? (
        <div className="flex-1 overflow-y-auto space-y-6">
          {(() => {
            const currentNote = notesDescription.find(n => n.page === pageNumber);
            if (!currentNote) return null;

            const multipleChoice = currentNote.mcq;

            const hasMCQ = multipleChoice && (
              (multipleChoice.easy && multipleChoice.easy.length > 0) ||
              (multipleChoice.medium && multipleChoice.medium.length > 0) ||
              (multipleChoice.hard && multipleChoice.hard.length > 0)
            );

            if (!hasMCQ) return (
              <div className="flex flex-col items-center justify-center text-gray-400 py-10">
                <p>No MCQ available.</p>
              </div>
            );

            return (
              <div>
                {multipleChoice.easy && multipleChoice.easy.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Easy</h4>
                    <div className="space-y-3">
                      {multipleChoice.easy.map((q: any, i: number) => (
                        <div key={`mcq-easy-${i}`} className="p-3 rounded-lg border bg-green-50/30 border-green-100 text-sm text-gray-700 space-y-2">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {q.question}
                          </ReactMarkdown>
                          <div>
                            <ul className="space-y-1 pl-4 list-disc">
                              {q.options.map((opt: string, optIndex: number) => (
                                <li key={optIndex} className={opt === q.answer ? "text-green-700 font-semibold" : ""}>
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                  >
                                    {opt}
                                  </ReactMarkdown>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {multipleChoice.medium && multipleChoice.medium.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">Medium</h4>
                    <div className="space-y-3">
                      {multipleChoice.medium.map((q: any, i: number) => (
                        <div key={`mcq-medium-${i}`} className="p-3 rounded-lg border bg-yellow-50/30 border-yellow-100 text-sm text-gray-700 space-y-2">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {q.question}
                          </ReactMarkdown>
                          <div>
                            <ul className="space-y-1 pl-4 list-disc">
                              {q.options.map((opt: string, optIndex: number) => (
                                <li key={optIndex} className={opt === q.answer ? "text-yellow-700 font-semibold" : ""}>
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                  >
                                    {opt}
                                  </ReactMarkdown>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {multipleChoice.hard && multipleChoice.hard.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Hard</h4>
                    <div className="space-y-3">
                      {multipleChoice.hard.map((q: any, i: number) => (
                        <div key={`mcq-hard-${i}`} className="p-3 rounded-lg border bg-red-50/30 border-red-100 text-sm text-gray-700">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {q.question}
                          </ReactMarkdown>
                          <ul className="space-y-1 pl-4 list-disc">
                            {q.options.map((opt: string, optIndex: number) => (
                              <li key={optIndex} className={opt === q.answer ? "text-red-700 font-semibold" : ""}>
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl p-6">
          <i className="fi fi-rr-checkbox text-4xl mb-2 opacity-20"></i>
          <p className="text-sm">No MCQ generated yet.</p>
        </div>
      )}
    </div>
  );
};
