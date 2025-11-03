// ============================================
// ResponseCard.tsx
// Displays AI Assistant's response neatly
// ============================================

import React from "react";
import type { QueryResponse } from "../../store/slices/assistantSlice";

interface Props {
  response: QueryResponse;
}

export const ResponseCard: React.FC<Props> = ({ response }) => {
  return (
    <div className="mt-6 p-5 border border-gray-200 bg-gray-50 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖 Assistant’s Answer:</h3>

      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {response.answer}
      </p>

      {response.sources_used !== undefined && (
        <div className="text-sm text-gray-500 mt-4">
          📚 <span className="italic">{response.sources_used}</span> sources referenced.
        </div>
      )}
    </div>
  );
};
