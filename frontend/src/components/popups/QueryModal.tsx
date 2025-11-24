import React from "react";
import { QueryBox } from "../atoms/QueryBox";


interface Props {
  setIsQueryOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const QueryModal: React.FC<Props> = ({ setIsQueryOpen }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-4">
      {/* Main Modal */}
      <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-2xl my-auto mx-4 max-h-[80vh] flex flex-col border border-[var(--border)]">
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[var(--background)] text-[var(--text)]">
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsQueryOpen(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsQueryOpen(false)}
                className="absolute -top-4 -right-4 bg-white text-gray-500 hover:text-red-500 p-2 rounded-full shadow-md hover:shadow-lg transition-all z-10"
              >
                <i className="fi fi-rr-cross-small text-xl flex"></i>
              </button>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span> Ask AI Assistant
                </h3>
                <QueryBox />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
