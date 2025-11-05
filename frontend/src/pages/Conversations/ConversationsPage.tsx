import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearConversations, fetchChats, fetchConversations, setSearch, setSelectedChat } from '../../store/slices/conversationsSlice';


export const ConversationsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { items, status, search, page, hasMore, selectedChat, chats } = useAppSelector(
    (state) => state.conversations
  );


  useEffect(() => {
    if (selectedChat) {
      console.log(selectedChat)
      dispatch(fetchConversations({ chat_id: selectedChat?.id }));
    }
    dispatch(fetchChats({ page: 1, limit: 10, search, user_id: user?._id || '' }));
  }, [dispatch, search, user, selectedChat]);

  const handleLoadMore = () => {
    if (hasMore && status !== 'loading') {
      dispatch(fetchChats({ page: page + 1, limit: 10, search, user_id: user?._id || '' }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearch(e.target.value));
    dispatch(clearConversations());
  };
  console.log(items.length)
  return (
    <div className="p-6 space-y-4 ">
      <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">Conversation History</h2>

      <input
        type="text"
        placeholder="Search conversations..."
        value={search}
        onChange={handleSearchChange}
        className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
      />

      <div className="mt-4 bg-[var(--background-alt)] border border-[var(--border)] rounded-lg divide-y divide-[var(--border)]">
        {chats.length === 0 && status !== 'loading' ? (
          <p className="text-center p-4 text-[var(--text-muted)]">No conversations found.</p>
        ) : (
          chats.map((c) => (
            <div
              key={c.id}
              className="p-4 cursor-pointer hover:bg-[var(--hover)] transition"
              onClick={() => dispatch(setSelectedChat(c))}
            >
              <p className="font-medium text-[var(--text)]">{c.title}</p>
              <span className="text-xs text-[var(--text-muted)]">{c.conversations.length} conversations</span>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={status === 'loading'}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-dark)]"
          >
            {status === 'loading' ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {selectedChat && (
        <div className="h-screen fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-4">
          <div className="h-screen bg-white dark:bg-black border rounded-lg shadow-xl w-full max-w-2xl mx-4 flex flex-col">
            <div className="flex justify-between items-center border-b border-[var(--border)] p-4">
              <h3 className="text-lg font-semibold text-[var(--text)]">Conversation Detail</h3>
              <button
                onClick={() => dispatch(setSelectedChat(null))}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>
            <div className="flex items-center px-8 py-4 gap-4 border-b border-[var(--border)]">
              <h4 className="font-semibold">Title:</h4>
              <p className="text-[var(--text)]">{selectedChat.title}</p>
            </div>
            <div className="overflow-y-auto max-h-[40vh]">
              {items.length > 0 && items?.map((conversation) => (
                <div key={conversation?.id} className="p-4 space-y-2 border-b mx-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-muted)]">Query:</h4>
                    <p className="text-[var(--text)]">{conversation.query}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-muted)]">Answer:</h4>
                    <p className="text-[var(--text)] whitespace-pre-line">{conversation.answer}</p>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {selectedChat.created_at}
                  </div>
                </div>
              ))}
            </div>
     
          </div>
        </div>
      )}
    </div>
  );
};
