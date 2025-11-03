import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearConversations, fetchConversations, setSearch, setSelectedConversation } from '../../store/slices/conversationsSlice';


export const ConversationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, status, search, page, hasMore, selectedConversation } = useAppSelector(
    (state) => state.conversations
  );

  useEffect(() => {
    dispatch(fetchConversations({ page: 1, limit: 10, search }));
  }, [dispatch, search]);

  const handleLoadMore = () => {
    if (hasMore && status !== 'loading') {
      dispatch(fetchConversations({ page: page + 1, limit: 10, search }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearch(e.target.value));
    dispatch(clearConversations());
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">Conversation History</h2>

      <input
        type="text"
        placeholder="Search conversations..."
        value={search}
        onChange={handleSearchChange}
        className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
      />

      <div className="mt-4 bg-[var(--background-alt)] border border-[var(--border)] rounded-lg divide-y divide-[var(--border)]">
        {items.length === 0 && status !== 'loading' ? (
          <p className="text-center p-4 text-[var(--text-muted)]">No conversations found.</p>
        ) : (
          items.map((c) => (
            <div
              key={c.id}
              className="p-4 cursor-pointer hover:bg-[var(--hover)] transition"
              onClick={() => dispatch(setSelectedConversation(c))}
            >
              <p className="font-medium text-[var(--text)]">{c.query}</p>
              <p className="text-sm text-[var(--text-muted)] line-clamp-2">{c.answer}</p>
              <span className="text-xs text-[var(--text-muted)]">{c.created_at}</span>
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

      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-y-auto max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-[var(--border)] p-4">
              <h3 className="text-lg font-semibold text-[var(--text)]">Conversation Detail</h3>
              <button
                onClick={() => dispatch(setSelectedConversation(null))}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-muted)]">Query:</h4>
                <p className="text-[var(--text)]">{selectedConversation.query}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-muted)]">Answer:</h4>
                <p className="text-[var(--text)] whitespace-pre-line">{selectedConversation.answer}</p>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {selectedConversation.created_at}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
