import React from "react";

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
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Subjective Questions</h3>
        <button
          onClick={handleGenerateQuiz}
          disabled={quizStatus === 'loading'}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Quiz"
        >
          {quizStatus === 'loading' ? (
            <i className="fi fi-br-circle animate-spin text-xs"></i>
          ) : (
            <i className="fi fi-rr-refresh"></i>
          )}
        </button>
      </div>

      {quizStatus === 'succeeded' && quizData?.questions?.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-3">
          {quizData.questions.map((q: any, i: number) => (
            <div key={i} className="p-4 rounded-xl border bg-white border-gray-200 shadow-sm">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-800 font-medium pt-0.5">
                  {q.question ? q.question : q}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : notesDescription.find(n => n.page === pageNumber)?.quiz ? (
        <div className="flex-1 overflow-y-auto space-y-6">
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
                        <div key={`sub-easy-${i}`} className="p-3 rounded-lg border bg-green-50/30 border-green-100 text-sm text-gray-700">
                          {q}
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
                        <div key={`sub-medium-${i}`} className="p-3 rounded-lg border bg-yellow-50/30 border-yellow-100 text-sm text-gray-700">
                          {q}
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
                        <div key={`sub-hard-${i}`} className="p-3 rounded-lg border bg-red-50/30 border-red-100 text-sm text-gray-700">
                          {q}
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
          <i className="fi fi-rr-list-check text-4xl mb-2 opacity-20"></i>
          <p className="text-sm">No quiz generated yet.</p>
        </div>
      )}
    </div>
  );
};
