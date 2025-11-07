import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearConversations, fetchChats, fetchConversations, setSearch, setSelectedChat } from '../../store/slices/conversationsSlice';
import { FullLayout } from '../../layouts/AppLayout';
import { useNavigate } from 'react-router-dom';


export const ChatsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { items, status, search, page, hasMore, selectedChat, chats } = useAppSelector(
    (state) => state.conversations
  );


  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchConversations({ chat_id: selectedChat?.id }));
    }
    if (user) {
      dispatch(fetchChats({ page: 1, limit: 100, search, user_id: user?._id || '' }));
    }
  }, [dispatch, search, user, selectedChat]);

  const handleLoadMore = () => {
    if (hasMore && status !== 'loading') {
      dispatch(fetchChats({ page: page + 1, limit: 100, search, user_id: user?._id || '' }));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearch(e.target.value));
    dispatch(clearConversations());
  };
  return (
    <FullLayout>

      <div className="bg-white max-w-4xl mx-auto py-2 px-4">
        <div className="rounded-lg overflow-hidden">
          <div className="py-2 flex items-center gap-2 border-b border-gray-100" onClick={() => navigate(-1)}>
            <i className="fi fi-sr-arrow-small-left flex items-center rounded-full bg-baigeLight p-1" />
            <h1 className="text-sm font-semibold">
              Chats
            </h1>
          </div>
          {status == "loading" && <p>Loading chats...</p>}
          {status == "failed" && <p className="text-red-500">Failed to load chats.</p>}
          <div className="grid grid-cols-3 gap-2 py-2">
            <input
              type="text"
              placeholder="Search Chats..."
              value={search}
              onChange={handleSearch}
              className="col-span-2 text-sm px-4 py-2 rounded-full border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-baigeLight"
            />
          </div>

          <div className="flex flex-col h-full">
            <h2 className="text-xs mb-2 px-2">found {chats.length} chats</h2>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto no-scrollbar space-y-2 p-2">
                  {Array.isArray(chats) ? chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="border border-gray-100 bg-baigeLight rounded-xl p-4 hover:shadow cursor-pointer flex items-center justify-between"
                      onClick={() => dispatch(setSelectedChat(chat))}
                    >
                      <div className="flex items-center gap-2">
                        {/* <img src={doc.avatar} alt={doc.name} className="h-12 w-12 rounded-full" /> */}
                        <div>
                          <p className="font-semibold">{chat.title}</p>
                          <p className="text-xs text-gray-400">{new Date(chat.created_at).toLocaleString()}</p>
                          {/* <p className="text-xs text-gray-400">{doc.documents?.length} students</p> */}
                          {/* <p className="text-xs text-gray-400">{teacher.documents?.length} study materials</p> */}
                        </div>
                      </div>
                      <button
                        className="px-4 py-2 bg-white border border-green text-green font-semibold rounded-full text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle assign action here
                          dispatch(setSelectedChat(chat));
                        }}
                      >
                        view
                      </button>
                    </div>
                  )) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 ">

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
    </FullLayout>

  );
};
