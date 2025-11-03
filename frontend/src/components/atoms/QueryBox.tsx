// ============================================
// QueryBox.tsx
// Lets users ask questions to the AI Assistant
// Connected to Redux (assistantSlice)
// ============================================

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { askQuery } from "../../store/slices/assistantSlice";
import { ResponseCard } from "./ResponseCard";

export const QueryBox: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.auth);
  const { queryStatus, response, error } = useSelector(
    (state: RootState) => state.assistant
  );

  const [question, setQuestion] = useState("");

  const handleAsk = async () => {
    if (!question.trim()) return alert("Please enter a question!");
    await dispatch(askQuery({text: question, userId: user?._id || ''}));
  };

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

      {response && <ResponseCard response={response} />}
    </div>
  );
};
