import React from 'react';

interface FloatingChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
        }`}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <i className="fi fi-rr-cross text-white text-xl flex"></i>
      ) : (
        <i className="fi fi-rr-comment-alt text-white text-xl flex"></i>
      )}
    </button>
  );
};
