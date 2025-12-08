import React from 'react';
import { useAppDispatch } from '../../../store';
import { fetchChatById, type ChatResponse } from '../../../store/slices/conversationsSlice';

interface ChatListViewProps {
  chats: ChatResponse[] | null;
  setSelectedChatId: (id: string | null) => void;
  teacherUserId: string | null;
  setTeacherUserId: (id: string | null) => void;
  studentUserId: string | null;
  setStudentUserId: (id: string | null) => void;
}

export const ChatListView: React.FC<ChatListViewProps> = ({
  chats,
  setSelectedChatId,
  teacherUserId,
  setTeacherUserId,
  studentUserId,
  setStudentUserId
}) => {
  const dispatch = useAppDispatch();

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Conversations</h3>
        <button
          onClick={() => {
            if (teacherUserId) setTeacherUserId(null);
            if (studentUserId) setStudentUserId(null);
          }}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-2">
        {chats && chats.length > 0 ? (
          chats.map((chatItem) => (
            <div
              key={chatItem.id}
              className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedChatId(chatItem.id as string);
                dispatch(fetchChatById(chatItem.id as string));
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {chatItem.title || "Untitled Chat"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(chatItem.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {chatItem.conversations.length} messages
                  </p>
                </div>
                <button
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition-colors flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedChatId(chatItem.id as string);
                    dispatch(fetchChatById(chatItem.id as string));
                  }}
                >
                  Open
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <i className="fi fi-rr-comment-alt text-4xl mb-2"></i>
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Start a new conversation below</p>
          </div>
        )}
      </div>
    </div>
  );
};
