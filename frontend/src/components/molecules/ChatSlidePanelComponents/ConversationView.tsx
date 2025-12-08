import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { useAppDispatch, useAppSelector } from '../../../store';
import { clearConversations, translateText, type ChatResponse } from '../../../store/slices/conversationsSlice';
import { useVoiceAssistant } from '../../../hooks/useVoiceAssistant';
import { QuickActionDisplay } from '../QuickActionDisplay';

interface ConversationViewProps {
  chat: ChatResponse | null;
  conversationChat: ChatResponse | null;
  setConversationChat: (chat: ChatResponse | null) => void;
  setSelectedChatId: (id: string | null) => void;
  teacherUserId: string | null;
  studentUserId: string | null;
  setReplyContext: (context: string | null) => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  chat,
  conversationChat,
  setConversationChat,
  setSelectedChatId,
  teacherUserId,
  studentUserId,
  setReplyContext
}) => {
  const dispatch = useAppDispatch();
  const { conversation, status } = useAppSelector((state) => state.conversations);

  // Voice Assistant
  const { speak, isPlaying, pause, resume, isSessionActive } = useVoiceAssistant();
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  // Quick Action State
  const [activeQuickAction, setActiveQuickAction] = useState<'quiz' | 'concept' | 'mcq' | 'tricks' | null>(null);

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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Back button when viewing a conversation */}
      {conversationChat && (teacherUserId || studentUserId) && (
        <div className="mb-4">
          <button
            onClick={() => {
              setConversationChat(null);
              setSelectedChatId(null);
              dispatch(clearConversations());
            }}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
          >
            <i className="fi fi-rr-arrow-left flex items-center"></i>
            Back
          </button>
        </div>
      )}

      {chat && chat?.conversations.length > 0 ? (
        chat?.conversations.map((conv) => (
          <div key={conv?.id} className="space-y-3">
            {/* User Query */}
            {conv.query && (
              <div className="flex justify-end gap-2">
                {conv?.attached_media && (
                  <img src={conv?.attached_media} className="w-16 h-16 object-cover rounded-xl border border-slate-100" alt="" onClick={() => window.open(conv?.attached_media, '_blank')} />
                )}
                <div className="bg-blue-500 text-white p-2 rounded-3xl rounded-tr-sm max-w-[80%] text-sm">
                  <div className="flex justify-between flex items-center p-2">
                    <p className="text-xs opacity-75">Student</p>

                    <div className="flex items-center gap-2">
                      <i
                        className={`fi ${activeSpeakingId === conv.id + '_query' && isPlaying ? 'fi-br-pause animate-pulse' : 'fi-br-speaker'} text-xs cursor-pointer`}
                        onClick={() => {
                          handleSpeak(conv.id + '_query', conversation?.id == conv.id && conversation?.translations?.[0]?.query ? conversation?.translations?.[0]?.query as string : conv.query);
                        }}
                      ></i>
                      <i
                        className={`fi ${status === 'loading' ? 'fi-br-spinner animate-spin' : 'fi-br-language'} text-xs`}
                        onClick={() => {
                          dispatch(translateText({
                            conversation_id: conv.id,
                            language: 'hinglish',
                            query: true
                          }));
                        }}
                      ></i>
                      <i
                        className="fi fi-br-arrow-small-left text-xs"
                        onClick={() => {
                          setReplyContext(conv.query);
                        }}
                      ></i>
                    </div>
                  </div>
                  {conv?.in_reply_to && (
                    <div className="text-xs w-84 bg-blue-600 text-gray-100 p-2 rounded-xl truncate">
                      <p className="text-xs opacity-75">In reply to:</p>
                      {conv?.in_reply_to}
                    </div>
                  )}
                  <div className="p-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {conversation?.id == conv.id && conversation?.translations?.[0]?.query ? conversation?.translations?.[0]?.query : conv.query}
                    </ReactMarkdown>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(conv.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Answer */}
            {conv.answer && (
              <div className="flex flex-col justify-start gap-2">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-3xl rounded-tl-sm max-w-[90%] text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                  <div className="flex justify-between flex items-center pb-1 mb-1">
                    <p className="text-xs opacity-75">Assistant</p>
                    <div className="flex items-center gap-2">
                      <i
                        className={`fi ${activeSpeakingId === conv.id + '_answer' && isPlaying ? 'fi-br-pause animate-ping' : 'fi-br-speaker'} text-xs cursor-pointer`}
                        onClick={() => {
                          handleSpeak(conv.id + '_answer', conversation?.id == conv.id && conversation?.translations?.[0]?.answer ? conversation?.translations?.[0]?.answer as string : conv.answer);
                        }}
                      ></i>
                      <i
                        className={`fi ${status === 'loading' ? 'fi-br-spinner animate-spin' : 'fi-br-language'} text-xs`}
                        onClick={() => {
                          // change language
                          dispatch(translateText({
                            conversation_id: conv.id,
                            language: 'hinglish',
                            query: false
                          }));
                        }}
                      ></i>
                      <i
                        className="fi fi-br-arrow-small-left text-xs"
                        onClick={() => {
                          setReplyContext(conv.query);
                        }}
                      ></i>
                    </div>
                  </div>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {conversation?.id == conv.id && conversation?.translations?.[0]?.answer ? conversation?.translations?.[0]?.answer as string : conv.answer}
                  </ReactMarkdown>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">

                    <button
                      onClick={() => handleQuickAction('mcq')}
                      className={`p-1.5 rounded-lg transition-colors ${activeQuickAction === 'mcq' ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30' : 'hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-500 hover:text-teal-600'}`}
                      title="Multiple Choice Quiz"
                    >
                      <i className="fi fi-rr-list-check text-xs"></i>
                    </button>
                    <button
                      onClick={() => handleQuickAction('quiz')}
                      className={`p-1.5 rounded-lg transition-colors ${activeQuickAction === 'quiz' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-500 hover:text-indigo-600'}`}
                      title="Short Answer Question"
                    >
                      <i className="fi fi-rr-text text-xs"></i>
                    </button>
                    <button
                      onClick={() => handleQuickAction('concept')}
                      className={`p-1.5 rounded-lg transition-colors ${activeQuickAction === 'concept' ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30' : 'hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-gray-500 hover:text-cyan-600'}`}
                      title="Follow On Concept"
                    >
                      <i className="fi fi-rr-bulb text-xs"></i>
                    </button>
                  </div>

                  {/* Quick Action Display Area */}
                  {activeQuickAction && (
                    <QuickActionDisplay
                      type={activeQuickAction}
                      data={conv.quick_action}
                      conversationId={conv.id}
                    />
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(conv.created_at).toLocaleTimeString()}
                  </p>
                </div>

                {/* teacher's comments */}
                {conv?.comments?.map((comment, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-3xl rounded-tl-sm max-w-[90%] text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                    <div className="flex justify-between flex items-center p-2 mb-1">
                      <p className="text-xs opacity-75">Teacher</p>
                      <div className="flex items-center gap-2">
                        {/* <i
                          className="fi fi-br-speaker text-xs"
                          onClick={() => {
                            handleSpeak(comment.timestamp + '_comment', comment?.comment_text);
                          }}
                        ></i> */}
                        <i
                          className="fi fi-br-arrow-small-left text-xs"
                          onClick={() => {
                            setReplyContext(conv.query);
                          }}
                        ></i>
                      </div>
                    </div>

                    {comment?.in_reply_to && (
                      <div className="text-xs w-84 bg-gray-200 text-gray-600 p-2 rounded-xl truncate">
                        <p className="text-xs opacity-75">In reply to:</p>
                        {comment?.in_reply_to}
                      </div>
                    )}
                    <div className="p-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {comment.comment_text}
                      </ReactMarkdown>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(comment.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
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
  );
};
