import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface QuizTabProps {
  pageNumber: number;
  notesDescription: any[];
  quizData: any;
  quizStatus: string;
  handleGenerateQuiz: () => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  pageNumber,
  notesDescription,
  quizData,
  quizStatus,
  handleGenerateQuiz,
}) => {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200 shrink-0">
        <h3 className="text-sm font-semibold text-gray-700">Short Answer Questions</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateQuiz}
            disabled={quizStatus === 'loading'}
            className="px-3 py-2 flex items-center gap-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200 hover:border-yellow-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
          >
            {quizStatus === 'loading' ? (

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
        {quizStatus === 'succeeded' && quizData?.questions?.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-3">
            {quizData.questions.map((q: any, i: number) => (
              <div key={i} className="p-4 rounded-xl border bg-white border-gray-200 shadow-sm">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  {/* <p className="text-sm text-gray-800 font-medium pt-0.5">
                    {q.question ? q.question : q}
                  </p> */}
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {q.question ? q.question : q}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notesDescription.find(n => n.page === pageNumber)?.quiz ? (
          <div className="flex-1 overflow-y-auto space-y-6 lg:p-2">
            {(() => {
              const currentNote = notesDescription.find(n => n.page === pageNumber);
              if (!currentNote) return null;

              const quiz = currentNote.quiz;

              const hasSubjective = quiz && (
                (quiz.easy && quiz.easy.length > 0) ||
                (quiz.medium && quiz.medium.length > 0) ||
                (quiz.hard && quiz.hard.length > 0)
              );

              if (!hasSubjective) return (
                <div className="flex flex-col items-center justify-center text-gray-400 py-10">
                  <p>No subjective questions available.</p>
                </div>
              );

              return (
                <div>
                  {quiz.easy && quiz.easy.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Easy</h4>
                      <div className="space-y-2">
                        {quiz.easy.map((q: string, i: number) => (
                          <div key={`sub-easy-${i}`} className="p-3 rounded-lg border bg-green-50 border-green-100 text-sm text-gray-700">
                            <span className="font-semibold">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                              >
                                {`Q${i + 1}. ${q}`}
                              </ReactMarkdown>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {quiz.medium && quiz.medium.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">Medium</h4>
                      <div className="space-y-2">
                        {quiz.medium.map((q: string, i: number) => (
                          <div key={`sub-medium-${i}`} className="p-3 rounded-lg border bg-yellow-50 border-yellow-100 text-sm text-gray-700">
                            <span className="font-semibold">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                              >
                                {`Q${i + 1}. ${q}`}
                              </ReactMarkdown>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {quiz.hard && quiz.hard.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Hard</h4>
                      <div className="space-y-2">
                        {quiz.hard.map((q: string, i: number) => (
                          <div key={`sub-hard-${i}`} className="p-3 rounded-lg border bg-red-50 border-red-100 text-sm text-gray-700">
                            <span className="font-semibold">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                              >
                                {`Q${i + 1}. ${q}`}
                              </ReactMarkdown>
                            </span>
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
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12 bg-gradient-to-br from-yellow-50 to-yellow-50 rounded-xl border-2 border-dashed border-yellow-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fi fi-rr-test flex items-center justify-center text-yellow-300 text-xl"></i>
            </div>
            <p className="text-sm font-medium mb-1">No quiz generated yet</p>
            <p className="text-xs text-gray-400 mb-4">Generate questions to test your knowledge</p>
            <button
              onClick={handleGenerateQuiz}
              disabled={quizStatus === 'loading'}
              className="px-4 py-2 bg-gradient-to-br from-yellow-300 to-amber-300 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            >
              {quizStatus === 'loading' ? (
                <>
                  <i className="fi fi-br-circle flex items-center justify-center animate-spin mr-2"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fi fi-sr-test flex items-center justify-center"></i> 
                  Generate Quiz
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
