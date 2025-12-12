import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { useAppDispatch, useAppSelector } from '../../../store';
import { translateText, type ChatResponse } from '../../../store/slices/conversationsSlice';
import { useVoiceAssistant } from '../../../hooks/useVoiceAssistant';
import { QuickActionDisplay } from '../QuickActionDisplay';
import type { TeacherModel } from '../../../store/slices/teachersSlice';

interface ConversationViewProps {
  chat: ChatResponse | null;
  setReplyContext: (context: string | null) => void;
  teacher?: TeacherModel;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  chat,
  setReplyContext,
  teacher
}) => {
  const dispatch = useAppDispatch();

  // Voice Assistant
  const { speak, isPlaying, pause, resume, isSessionActive } = useVoiceAssistant();
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  // Quick Action State
  const [activeQuickAction, setActiveQuickAction] = useState<'quiz' | 'concept' | 'mcq' | 'tricks' | null>(null);

  const { conversation, status } = useAppSelector((state) => state.conversations);

  const handleQuickAction = (type: 'quiz' | 'concept' | 'mcq' | 'tricks') => {
    setActiveQuickAction(prev => {
      const current = prev;
      if (current === type) return null;
      return type;
    });
  };

  // Reset active ID when speech session ends
  useEffect(() => {
    if (!isSessionActive) {
      setActiveSpeakingId(null);
    }

  }, [isSessionActive]);

  const handleSpeak = (id: string, text: string) => {
    if (activeSpeakingId === id) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      speak(text);
      setActiveSpeakingId(id);
    }
  };


  const ChatFeatures = ({ conv, query }: any) => {
    return (
      <div className="flex items-center gap-2">
        <button
          title="Speak"
          className={`w-6 h-6 rounded-full flex items-center justify-center border border-logoPurple bg-white hover:shadow-md transition-colors ${activeSpeakingId === conv.id + '_query' && isPlaying ? 'animate-pulse text-logoPurple' : ''}`}
          onClick={() => {
            handleSpeak(conv.id + '_query', conversation?.id == conv.id && conversation?.translations?.[0]?.query ? conversation?.translations?.[0]?.query as string : conv.query);
          }}
        >
          <i className={`fi ${activeSpeakingId === conv.id + '_query' && isPlaying ? 'fi-br-pause' : 'fi-sr-volume'} flex items-center justify-center text-logoPurple`}></i>
        </button>
        <button
          title="Translate"
          className={`w-6 h-6 rounded-full flex items-center justify-center border border-logoSky bg-white hover:shadow-md transition-colors ${status === 'loading' ? 'animate-spin text-logoSky' : ''}`}
          onClick={() => {
            dispatch(translateText({
              conversation_id: conv.id,
              language: 'hinglish',
              query: query
            }));
          }}
        >
          <i className={`fi ${status === 'loading' ? 'fi-br-spinner' : 'fi-br-language'} flex items-center justify-center text-logoSky`}></i>
        </button>
        <button
          title="Reply"
          className="w-6 h-6 rounded-full flex items-center justify-center border border-logoPurple bg-white hover:shadow-md transition-colors"
          onClick={() => {
            setReplyContext(conv.query);
          }}
        >
          <i className="fi fi-br-arrow-small-left flex items-center justify-center text-logoPurple"></i>
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex-1 overflow-y-auto">
      <div className="p-4 space-y-4 bg-white">
        {chat && chat?.conversations.length > 0 ? (
          chat?.conversations.map((conv) => (
            <div key={conv?.id} className="space-y-3">
              {/* User Query */}
              {conv.query && (
                <div className="flex justify-end gap-2 animate-fade-in-up">
                  {conv?.attached_media && (
                    <img src={conv?.attached_media} className="w-16 h-16 object-cover rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-105" alt="" onClick={() => window.open(conv?.attached_media, '_blank')} />
                  )}
                  <div className="bg-gradient-to-br from-logoSky to-logoPink text-black p-3 rounded-2xl rounded-tr-sm w-80 text-sm shadow-md">
                    <div className="flex justify-between items-center mb-1 pb-2 border-b border-white">
                      <p className="text-xs font-bold opacity-90">You</p>
                      <ChatFeatures conv={conv} query={true} />
                    </div>
                    {conv?.in_reply_to && (
                      <div className="text-xs mb-2 bg-black text-white p-2 rounded-lg border-l-2 border-white">
                        <p className="text-xs font-bold opacity-75 mb-0.5">Replying to:</p>
                        <p className="truncate">{conv?.in_reply_to}</p>
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-white prose-strong:text-white">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {conversation?.id == conv.id && conversation?.translations?.[0]?.query ? conversation?.translations?.[0]?.query : conv.query}
                      </ReactMarkdown>
                    </div>
                    <p className="text-[10px] opacity-60 mt-1 text-right font-medium">
                      {new Date(conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Answer */}
              {conv.answer && (
                <div className="flex flex-col justify-start gap-2 animate-fade-in-up delay-75">
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl rounded-tl-sm w-full text-sm text-slate-800 dark:text-slate-200 shadow-sm">
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-logoBlue to-logoViolet rounded-lg flex items-center justify-center">
                          <i className="fi fi-rr-sparkles text-white flex items-center justify-center"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Maiind</p>
                      </div>
                      <ChatFeatures conv={conv} query={false} />
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:leading-relaxed prose-strong:text-slate-900 dark:prose-strong:text-white pb-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {conversation?.id == conv.id && conversation?.translations?.[0]?.answer ? conversation?.translations?.[0]?.answer as string : conv.answer}
                      </ReactMarkdown>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleQuickAction('mcq')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${activeQuickAction === 'mcq' ? 'bg-logoPink text-white border-white' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-logoPink hover:text-logoPink hover:shadow-sm'}`}
                      >
                        <i className="fi fi-sr-quiz-alt flex items-center justify-center"></i>
                        <span className="hidden lg:inline-block">MCQ</span>
                      </button>
                      <button
                        onClick={() => handleQuickAction('quiz')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${activeQuickAction === 'quiz' ? 'bg-logoSky text-white border-white' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-logoSky hover:text-logoSky hover:shadow-sm'}`}
                      >
                        <i className="fi fi-sr-test flex items-center justify-center"></i>
                        <span className="hidden lg:inline-block">Quiz</span>
                      </button>
                      <button
                        onClick={() => handleQuickAction('concept')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${activeQuickAction === 'concept' ? 'bg-logoPurple text-white border-white' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-logoPurple hover:text-logoPurple hover:shadow-sm'}`}
                      >
                        <i className="fi fi-sr-bulb flex items-center justify-center"></i>
                        <span className="hidden lg:inline-block">Concept</span>
                      </button>
                    </div>

                    {/* Quick Action Display Area */}
                    {activeQuickAction && (
                      <div className="mt-4 animate-fade-in-up">
                        <QuickActionDisplay
                          type={activeQuickAction}
                          data={conv.quick_action}
                          conversationId={conv.id}
                        />
                      </div>
                    )}

                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium text-right">
                      {new Date(conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* teacher's comments */}
                  {conv?.comments?.map((comment, i) => (
                    <div key={i} className="bg-gradient-to-br from-slate-100 to-white border border-slate-100 p-3 rounded-2xl rounded-tl-sm text-sm text-slate-700 shadow-sm ml-2">
                      <div className="flex justify-between items-center mb-1 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-br from-logoPurple to-logoPink rounded-lg flex items-center justify-center text-white w-6 h-6 ">
                            <i className="fi fi-sr-chalkboard-user text-xs flex items-center justify-center"></i>
                          </div>
                          <p className="text-xs font-semibold text-slate-800">{teacher?.name}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="w-6 h-6 rounded-full flex items-center justify-center border border-logoPurple bg-white hover:text-slate-600 transition-colors"
                            onClick={() => {
                              setReplyContext(conv.query);
                            }}
                          >
                            <i className="fi fi-br-arrow-small-left flex items-center justify-center text-logoPurple"></i>
                          </button>
                        </div>
                      </div>

                      {comment?.in_reply_to && (
                        <div className="text-xs mb-2 bg-slate-200 text-slate-600 p-2 rounded-lg border-l-2 border-slate-300">
                          <p className="font-bold opacity-75 mb-0.5">Replying to:</p>
                          <p className="truncate">{comment?.in_reply_to}</p>
                        </div>
                      )}
                      <div className="prose prose-sm max-w-none text-slate-700 prose-p:leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {comment.comment_text}
                        </ReactMarkdown>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 text-right font-medium">
                        {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <i className="fi fi-rr-comment-alt text-4xl mb-2"></i>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start a conversation below</p>
          </div>
        )}
      </div>

    </div>
  );
};
