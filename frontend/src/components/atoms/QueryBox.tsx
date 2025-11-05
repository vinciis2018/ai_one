// ============================================
// QueryBox.tsx
// Lets users ask questions to the AI Assistant
// Connected to Redux (assistantSlice)
// ============================================

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { askQuery } from "../../store/slices/assistantSlice";
import { ResponseCard } from "./ResponseCard";
import { fetchChatById } from "../../store/slices/conversationsSlice";

export const QueryBox: React.FC = () => {
  const dispatch = useAppDispatch();


  const {user} = useAppSelector((state) => state.auth);
  const { queryStatus, response, error } = useAppSelector(
    (state) => state.assistant
  );


  const {chat: chatConversation} = useAppSelector((state) => state.conversations); 

  const [question, setQuestion] = useState("");

  const handleAsk = async () => {
    if (!question.trim()) return alert("Please enter a question!");
    await dispatch(askQuery({
      text: question,
      userId: user?._id || '',
      chatId: response?.chat_id || "",
      previousConversation: response?.conversation_id || "",
      domain_expertise: 'science',
    }));
  };

  useEffect(() => {
    if (response) {
      dispatch(fetchChatById(response.chat_id)).unwrap();
    }
  },[dispatch, response]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        💭 Ask a Question
      </h2>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something based on your uploaded materials..."
        className="w-full h-24 border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
      />

      <button
        onClick={handleAsk}
        disabled={queryStatus === "loading"}
        className={`mt-4 px-5 py-2 rounded-lg font-medium text-white transition ${
          queryStatus === "loading"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {queryStatus === "loading" ? "Thinking..." : "Ask"}
      </button>

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">❌ {error}</p>
      )}

      {response && (
        <div>
          <ResponseCard response={response} />
          <div className="border-t mt-4 text-sm text-gray-500">
            {chatConversation && chatConversation.conversations.length > 0 && chatConversation.conversations.map((conversation) => (
              <div key={conversation.id} className="mt-4">
                📄 {conversation.query_by}: <span className="font-semibold">{conversation.query}</span><br/>
                🗂️ {conversation.answer_by}: <span className="font-medium">{conversation.answer}</span>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
