import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchChatBySpace } from '../../store/slices/conversationsSlice';
import { QueryBoxChat } from '../atoms/QueryBoxChat';
import { EnhancedTextDisplay } from '../atoms/EnhancedTextDisplay';
import { useLocation } from 'react-router-dom';

interface ChatSlidePanelProps {
  isOpen: boolean;
  chatId: string;
  domain: string;
  onClose: () => void;
}

export const ChatSlidePanel: React.FC<ChatSlidePanelProps> = ({ isOpen, chatId, domain, onClose }) => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { chat } = useAppSelector((state) => state.conversations);
  const { user } = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (isOpen && pathname) {
      const chat_space = pathname.split("/").splice(1).join("/");
      dispatch(fetchChatBySpace({ user_id: user?._id as string, chat_space: chat_space }));
    }
  }, [isOpen, chatId, dispatch]);

  console.log(chat)
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
              <i className="fi fi-rr-sparkles text-sm"></i>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">AI Assistant</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ask me anything</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <i className="fi fi-rr-cross text-gray-600 dark:text-gray-300 flex"></i>
          </button>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chat && chat?.conversations.length > 0 ? (
            chat?.conversations.map((conversation) => (
              <div key={conversation?.id} className="space-y-3">
                {/* User Query */}
                {conversation.query && (
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%]">
                      <p className="text-sm whitespace-pre-line">{conversation.query}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(conversation.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* AI Answer */}
                {conversation.answer && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
                      <EnhancedTextDisplay
                        className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line"
                        content={conversation.answer}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(conversation.created_at).toLocaleTimeString()}
                      </p>
                    </div>
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

        {/* Query Box */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <QueryBoxChat
            chatId={chatId}
            domain={domain}
            teacher_user_id={user?.teacher_id ? user?._id : null}
            student_user_id={user?.student_id ? user?._id : null}
          />
        </div>
      </div>
    </>
  );
};
