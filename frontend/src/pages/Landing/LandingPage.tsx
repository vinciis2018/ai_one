// ============================================
// App.tsx
// Main application layout for AI Assistant MVP
// Combines UploadBox + QueryBox in a clean interface
// ============================================

import React from "react";
// import { UploadBox } from "../../components/atoms/UploadBox";
import { QueryBox } from "../../components/atoms/QueryBox";
import { FullLayout } from "../../layouts/AppLayout";

export const LandingPage: React.FC = () => {
  return (
    <FullLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center">
        {/* Main Content */}
        <main className="w-full max-w-3xl px-4">
          {/* <UploadBox /> */}
          <QueryBox />
        </main>
      </div>
    </FullLayout>
  );
};
