import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store';
import { submitQuizAnswers } from '../../store/slices/conversationsSlice';

interface QuickActionDisplayProps {
  type: 'quiz' | 'concept' | 'mcq' | 'tricks';
  data: any;
  conversationId: string;
}

export const QuickActionDisplay: React.FC<QuickActionDisplayProps> = ({ type, data, conversationId }) => {
  if (!data) return null;

  const dispatch = useAppDispatch();

  // Check if user_answer already exists in the data
  const hasExistingAnswers = data.micro_quiz?.some((q: any) => q.user_answer !== undefined && q.user_answer !== null);

  // State for user answers: { questionIndex: selectedAnswer }
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(hasExistingAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize userAnswers from existing data if available
  useEffect(() => {
    if (hasExistingAnswers && data.micro_quiz) {
      const existingAnswers: Record<number, string> = {};
      data.micro_quiz.forEach((q: any, index: number) => {
        if (q.user_answer !== undefined && q.user_answer !== null) {
          existingAnswers[index] = q.user_answer;
        }
      });
      setUserAnswers(existingAnswers);
    }
  }, [data, hasExistingAnswers]);

  const handleMCQSelect = (questionIndex: number, option: string) => {
    if (!showResults) {
      setUserAnswers(prev => ({ ...prev, [questionIndex]: option }));
    }
  };

  const handleShortAnswerChange = (questionIndex: number, value: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Create a deep copy of the data with user answers added
    const updatedQuickAction = {
      ...data,
      micro_quiz: data.micro_quiz?.map((q: any, index: number) => ({
        ...q,
        user_answer: userAnswers[index] || null,
      })),
    };

    try {
      // Dispatch the action to submit quiz answers
      await dispatch(submitQuizAnswers({
        conversation_id: conversationId,
        quick_action: updatedQuickAction,
      })).unwrap();

      setShowResults(true);
    } catch (error) {
      console.error('Failed to submit quiz answers:', error);
      // Still show results even if submission fails
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (type === "mcq") {
    return (
      <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl p-4">
          <div className="space-y-4">
            {data.micro_quiz?.filter((q: any) => q.question_type === 'multiple_choice')?.map((q: any, i: number) => {
              const userAnswer = userAnswers[i];
              const correctOption = q.correct_option;
              const isCorrect = showResults && userAnswer?.split(".")[0] === correctOption;
              const isIncorrect = showResults && userAnswer && userAnswer?.split(".")[0] !== correctOption;

              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-violet-100 dark:border-violet-800/50">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      <span className="text-violet-500 mr-2">{i + 1}.</span>
                      {q.question}
                    </p>
                    {showResults && (
                      <div className="ml-2">
                        {isCorrect ? (
                          <i className="fi fi-rr-check-circle text-green-500 text-sm"></i>
                        ) : isIncorrect ? (
                          <i className="fi fi-rr-cross-circle text-red-500 text-sm"></i>
                        ) : (
                          <i className="fi fi-rr-minus-circle text-gray-400 text-sm"></i>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 ml-4">
                    {q.options?.map((opt: string, j: number) => {
                      const optionLetter = opt.split(".")[0];
                      const isSelected = userAnswer === opt;
                      const isCorrectOption = optionLetter === correctOption;

                      let className = "text-xs p-2 rounded border transition-colors cursor-pointer ";

                      if (showResults) {
                        if (isCorrectOption) {
                          className += "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 font-medium";
                        } else if (isSelected && !isCorrectOption) {
                          className += "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
                        } else {
                          className += "bg-gray-50 border-gray-100 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400";
                        }
                      } else {
                        if (isSelected) {
                          className += "bg-violet-50 border-violet-300 text-violet-700 dark:bg-violet-900/30 dark:border-violet-600 dark:text-violet-300 font-medium";
                        } else {
                          className += "bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 hover:bg-violet-50 hover:border-violet-200 dark:hover:bg-violet-900/20";
                        }
                      }

                      return (
                        <div
                          key={j}
                          onClick={() => handleMCQSelect(i, opt)}
                          className={className}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            {showResults && isCorrectOption && (
                              <i className="fi fi-rr-check ml-2 text-[10px]"></i>
                            )}
                            {showResults && isSelected && !isCorrectOption && (
                              <i className="fi fi-rr-cross ml-2 text-[10px]"></i>
                            )}
                            {!showResults && isSelected && (
                              <i className="fi fi-rr-check ml-2 text-[10px]"></i>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <div className="mt-4 flex gap-2">
                    {!showResults && (
                      <button
                        onClick={handleSubmit}
                        disabled={Object.keys(userAnswers).length === 0 || isSubmitting}
                        className="px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        {isSubmitting && <i className="fi fi-rr-spinner animate-spin"></i>}
                        {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )
  }

  if (type === "quiz") {
    return (
      <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
          <div className="space-y-4">
            {data.micro_quiz?.filter((q: any) => q.question_type === 'short_answer')?.map((q: any, i: number) => {
              const userAnswer = userAnswers[i]?.trim().toLowerCase();
              const correctAnswer = q.answer?.trim().toLowerCase();
              const isCorrect = showResults && userAnswer === correctAnswer;
              const isIncorrect = showResults && userAnswer && userAnswer !== correctAnswer;

              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      <span className="text-indigo-500 mr-2">{i + 1}.</span>
                      {q.question}
                    </p>
                    {showResults && (
                      <div className="ml-2">
                        {isCorrect ? (
                          <i className="fi fi-rr-check-circle text-green-500 text-sm"></i>
                        ) : isIncorrect ? (
                          <i className="fi fi-rr-cross-circle text-red-500 text-sm"></i>
                        ) : (
                          <i className="fi fi-rr-minus-circle text-gray-400 text-sm"></i>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 mt-2 space-y-2">
                    <input
                      type="text"
                      value={userAnswers[i] || ''}
                      onChange={(e) => handleShortAnswerChange(i, e.target.value)}
                      disabled={showResults}
                      placeholder="Type your answer here..."
                      className={`w-full text-sm p-2 rounded border transition-colors ${showResults
                        ? isCorrect
                          ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                          : isIncorrect
                            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                            : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                        : 'bg-white border-indigo-200 text-gray-800 dark:bg-gray-700 dark:border-indigo-600 dark:text-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800'
                        } outline-none`}
                    />

                    {showResults && (
                      <div className="text-xs p-2 rounded bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 font-medium">
                        <span className="font-semibold">Correct Answer:</span> {q.answer}
                        <i className="fi fi-rr-check ml-2 text-[10px]"></i>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="mt-4 flex gap-2">
                    {!showResults && (
                      <button
                        onClick={handleSubmit}
                        disabled={Object.keys(userAnswers).length === 0 || isSubmitting}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        {isSubmitting && <i className="fi fi-rr-spinner animate-spin"></i>}
                        {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )
  }

  if (type === "concept") {
    return (
      <div className="">
        {data.follow_on_concept && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 flex items-start gap-3">
            <i className="fi fi-rr-bulb text-blue-500 mt-0.5"></i>
            <div>
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">Follow-on Concept</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">{data.follow_on_concept}</p>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  return null;
};
