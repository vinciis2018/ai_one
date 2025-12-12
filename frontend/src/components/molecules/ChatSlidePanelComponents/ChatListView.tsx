import React from 'react';
import { useAppDispatch } from '../../../store';
import { fetchChatById, type ChatResponse } from '../../../store/slices/conversationsSlice';

interface ChatListViewProps {
  chats: ChatResponse[] | null;
  setSelectedChatId: (id: string | null) => void;
}

export const ChatListView: React.FC<ChatListViewProps> = ({
  chats,
  setSelectedChatId,
}) => {
  const dispatch = useAppDispatch();

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-3 bg-white">
        {chats && chats.length > 0 ? (
          chats.map((chatItem) => (
            <div
              key={chatItem.id}
              className="group border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 hover:shadow-lg hover:border-logoBlue transition-all duration-300 cursor-pointer relative overflow-hidden"
              onClick={() => {
                setSelectedChatId(chatItem.id as string);
                dispatch(fetchChatById(chatItem.id as string));
              }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-logoPink rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform duration-500" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate mb-1">
                    {chatItem.title || "Untitled Chat"}
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      <i className="fi fi-rr-calendar flex items-center justify-center"></i>
                      {new Date(chatItem.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                      <i className="fi fi-rr-comment-alt flex items-center justify-center"></i>
                      {chatItem.conversations.length}
                    </p>
                  </div>
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-logoBlue group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedChatId(chatItem.id as string);
                    dispatch(fetchChatById(chatItem.id as string));
                  }}
                >
                  <i className="fi fi-rr-angle-small-right text-lg flex items-center justify-center"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-3xl">
              <i className="fi fi-rr-comment-alt-slash"></i>
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">No conversations yet</p>
            <p className="text-xs text-slate-400">Start a new conversation to get help</p>
          </div>
        )}
      </div>
    </div>
  );
};
