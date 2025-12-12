import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearConversations, fetchChats, fetchConversations, setSearch, setSelectedChat } from '../../store/slices/conversationsSlice';
import { FullLayout } from '../../layouts/AppLayout';
import { useNavigate } from 'react-router-dom';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { LoadingComponent } from '../../components/molecules/LoadingComponent';

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

  // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   dispatch(setSearch(e.target.value));
  //   dispatch(clearConversations());
  // };

  return (
    <FullLayout>
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-4 lg:py-8">

          {/* Header Section */}
          <div className=" mb-4 lg:mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center lg:gap-4 gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="group flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                >
                  <i className="fi fi-rr-arrow-small-left text-slate-700 dark:text-gray-600 group-hover:text-logoBlue transition-colors" />
                </button>
                <div>
                  <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent">
                    Chats
                  </h1>
                  <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'} found
                  </p>
                </div>
              </div>
            </div>

            {/* Search Section */}
            {/* <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-sm rounded-2xl pb-2">
              <div className="flex flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search chats by title..."
                    value={search}
                    onChange={handleSearch}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-100 dark:border-white focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all duration-300 bg-slate-50 dark:bg-white font-medium text-slate-900 dark:text-slate-900 placeholder:text-slate-400"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <i className="fi fi-rr-search"></i>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Loading State */}
          {status === "loading" && chats.length === 0 && (
            <LoadingComponent size="sm" message="Loading your content..." />
          )}

          {/* Error State */}
          {status === "failed" && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-500 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                <i className="fi fi-rr-cross-circle flex items-center justify-center text-red-500 text-xl" />
              </div>
              <div>
                <p className="text-red-800 dark:text-red-200 font-semibold">Failed to load chats</p>
                <button
                  onClick={() => dispatch(fetchChats({ page: 1, limit: 100, search, user_id: user?._id || '' }))}
                  className="text-red-600 dark:text-red-300 text-sm mt-1 hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Chats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(chats) && chats.map((chat, index) => (
              <div
                key={chat.id}
                className="group relative bg-white dark:bg-black backdrop-blur-xl rounded-2xl p-5 hover:shadow-xl transition-all duration-300 cursor-pointer border border-white hover:border-logoBlue dark:hover:border-logoBlue transform hover:-translate-y-1 overflow-hidden"
                onClick={() => dispatch(setSelectedChat(chat))}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="grid grid-cols-12 min-w-0 w-full">
                    <div className="relative col-span-3 lg:col-span-2 md:col-span-2 w-12 h-12 rounded-2xl bg-gradient-to-br from-logoSky to-logoViolet flex items-center justify-center text-white shadow-lg shadow-logoBlue group-hover:scale-110 transition-transform duration-300">
                      <i className="fi fi-rr-comment-alt flex items-center justify-center text-xl" />
                      <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-slate-100 text-xs text-slate-600 border border-slate-100 group-hover:border-logoBlue group-hover:text-logoBlue group-hover:bg-white transition-colors">
                        {chat.conversations?.length || 0}
                      </span>
                    </div>
                    <div className="col-span-9 lg:col-span-10 md:col-span-10 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-logoBlue transition-colors truncate text-base">
                        {chat.title || 'Untitled Chat'}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                        <span className="flex items-center gap-1.5">
                          <i className="fi fi-rr-calendar text-logoPink flex items-center justify-center"></i>
                          {new Date(chat.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <i className="fi fi-rr-clock text-logoPurple flex items-center justify-center"></i>
                          {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-100 group-hover:border-logoBlue group-hover:text-logoBlue group-hover:bg-white transition-colors hidden lg:inline-block">
                          {chat.conversations?.length || 0} msgs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-logoBlue group-hover:text-white transition-all duration-300"
                    >
                      <i className="fi fi-rr-angle-small-right text-lg flex items-center justify-center"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="col-span-full text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={status === 'loading'}
                  className="px-8 py-3 bg-slate-50 border-2 border-slate-100 text-slate-600 rounded-xl font-bold hover:bg-white hover:border-logoBlue hover:text-logoBlue transition-all shadow-sm hover:shadow-md"
                >
                  {status === 'loading' ? (
                    <LoadingComponent size="sm" message="Loading your conversations..." />
                  ) : 'Load More Conversations'}
                </button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {!status && chats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-white border border-slate-100 dark:border-white flex items-center justify-center mb-6 shadow-sm">
                <i className="fi fi-rr-comments text-slate-300 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No chats found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-md font-medium mb-6">
                {search ? "Try adjusting your search terms." : "Start a new conversation to see it here."}
              </p>
              {search && (
                <button
                  onClick={() => {
                    dispatch(setSearch(''));
                    dispatch(clearConversations());
                  }}
                  className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Details Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-white backdrop-blur-sm flex items-center justify-center z-50 p-1 lg:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-160 rounded-3xl shadow-2xl flex flex-col border border-white dark:border-slate-800 overflow-hidden transform transition-all scale-100 relative">

            {/* Modal Header */}
            <div className="grid grid-cols-10 p-5 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
              <div className="col-span-9 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-logoBlue to-logoViolet flex items-center justify-center text-white shadow-lg shadow-logoBlue">
                  <i className="fi fi-rr-sparkles text-xl flex items-center justify-center" />
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base lg:text-lg truncate">{selectedChat.title || "Conversation"}</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(selectedChat.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <button
                  onClick={() => {
                    dispatch(setSelectedChat(null));
                    clearConversations();
                  }}
                  className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-slate-700 transition-colors"
              >
                <i className="fi fi-rr-cross-small text-xl flex items-center justify-center" />
              </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-black pt-24 custom-scrollbar">
              {items.length > 0 ? items.map((conversation, idx) => (
                <div key={conversation?.id || idx} className="space-y-6">
                  {/* User Query */}
                  {conversation.query && (
                    <div className="flex justify-end pl-12 group">
                      <div className="bg-gradient-to-br from-logoSky to-logoPink text-black rounded-2xl rounded-tr-sm p-4 shadow-sm max-w-2xl transform transition-transform duration-300 hover:-translate-y-0.5">
                        <p className="text-sm font-medium whitespace-pre-line leading-relaxed">{conversation.query}</p>
                      </div>
                    </div>
                  )}

                  {/* Assistant Answer */}
                  {conversation.answer && (
                    <div className="flex justify-start pr-12 group">
                      <div className="flex items-start gap-3 max-w-3xl">
                        <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-logoBlue to-logoViolet flex-shrink-0 flex items-center justify-center text-white shadow-md">
                          <i className="fi fi-rr-sparkles text-xs flex items-center justify-center"></i>
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm p-5 shadow-sm transform transition-transform duration-300 hover:-translate-y-0.5 w-full">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              components={{
                                code({ node, className, children, ...props }) {
                                  return (
                                    <code className={`${className} bg-slate-100 dark:bg-slate-900 rounded px-1 py-0.5`} {...props}>
                                      {children}
                                    </code>
                                  )
                                }
                              }}
                            >
                              {conversation.answer}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <i className="fi fi-rr-comment-dots text-2xl opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No messages in this conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </FullLayout>
  );
};
