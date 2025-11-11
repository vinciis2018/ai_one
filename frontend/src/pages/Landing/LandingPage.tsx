// ============================================
// App.tsx
// Main application layout for AI Assistant MVP
// Combines UploadBox + QueryBox in a clean interface
// ============================================

import React from "react";
// import { UploadBox } from "../../components/atoms/UploadBox";
import { QueryBox } from "../../components/atoms/QueryBox";
import { FullLayout } from "../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const {isAuthenticated, user} = useAppSelector((state) => state.auth);
  const sectionOptions = [{
    key: 1,
    label: user?.role === "student" ? "Teachers" : "Students",
    icon: user?.role === "student" ? "fi-sr-chalkboard-user text-violet" : "fi-ss-student text-violet",
    description: user?.role === "student" ? "Pick your teacher's mind and resolve your doubts" : "Find students and see what they are talking about",
    onClick: () => user?.role === "student" ? navigate("/teachers") : navigate("/students")
  }, {
    key: 2,
    label: "Notes",
    icon: "fi-sr-journal-alt text-sun",
    description: "Go through your notes and revise your syllabus",
    onClick: () => navigate("/notes")

  }, {
    key: 3,
    label: "Coachings",
    icon: "fi-sr-graduation-cap text-orange2",
    description: "Find teachers from your favourite institutes",
    onClick: () => navigate("/coachings")
  }, {
    key: 4,
    label: "Chats",
    icon: "fi-sr-messages text-green",
    description: "Check your chat history for any previous recalls",
    onClick: () => navigate("/chats")
  }]

  return (
    <FullLayout>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center">
        {/* Main Content */}
        <main className="w-full max-w-3xl">
          <div className="p-4">
            <QueryBox />
          </div>
         {/* Feature Boxes */}
          <div className="grid grid-cols-2 gap-4 p-4">
            {sectionOptions?.map((option) => (
              <div onClick={isAuthenticated ? option.onClick : () => alert("please login first")} key={option.key} className="relative p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-100 hover:shadow-lg transition-shadow">
                <h3 className="text-md font-semibold text-gray-800 mb-1">{option.label}</h3>
                <p className="text-xs text-gray-600">{option.description}</p>
                <div className="text-6xl absolute bottom-2 right-2 opacity-10">
                  <i className={`fi ${option.icon} flex items-center justify-center`}></i>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </FullLayout>
  );
};
