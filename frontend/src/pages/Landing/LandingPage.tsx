// ============================================
// LandingPage.tsx
// Main landing page with features and query box
// ============================================

import React, { useState } from "react";
import { FullLayout } from "../../layouts/AppLayout";
import NeuronAnimation from "../../components/NeuronAnimation";
import { FeaturesSection } from "./FeaturesSection";
import { QueryModal } from "../../components/popups/QueryModal";

export const LandingPage: React.FC = () => {
  const [isQueryOpen, setIsQueryOpen] = useState(false);


  return (
    <FullLayout>
      <NeuronAnimation />
      <div className="min-h-screen w-full bg-gradient-to-br from-white to-blue-50 flex flex-col items-center">

        {/* Floating Action Button */}
        <button
          onClick={() => setIsQueryOpen(true)}
          className="fixed bottom-8 right-8 z-50 bg-green hover:bg-green2 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open AI Assistant"
        >
          <i className="fi fi-rr-sparkles text-2xl flex items-center justify-center animate-pulse"></i>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ask AI
          </span>
        </button>

        {isQueryOpen && (
          <QueryModal
            setIsQueryOpen={setIsQueryOpen}
            onClose={() => setIsQueryOpen(false)}
          />
        )}

        {/* Features Section */}
        <FeaturesSection />

      </div>
    </FullLayout>
  );
};
