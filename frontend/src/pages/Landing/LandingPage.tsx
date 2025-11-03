// ============================================
// App.tsx
// Main application layout for AI Assistant MVP
// Combines UploadBox + QueryBox in a clean interface
// ============================================

import React from "react";
import { UploadBox } from "../../components/atoms/UploadBox";
import { QueryBox } from "../../components/atoms/QueryBox";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4 mb-6">
        <h1 className="text-2xl font-bold text-center text-blue-700">
          🎓 Student AI Assistant
        </h1>
        <p className="text-center text-gray-500 text-sm">
          Learn smarter — Ask, upload, and explore your study materials.
        </p>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-3xl px-4">
        <UploadBox />
        <QueryBox />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Coaching AI Assistant. All rights reserved.
      </footer>
    </div>
  );
};
