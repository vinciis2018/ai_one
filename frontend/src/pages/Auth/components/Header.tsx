import React from 'react';

interface HeaderProps {
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
  return (
    <div className="p-2 sm:p-3 border-b border-gray-100 flex items-center bg-gray-50">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
      >
        <i className="fi fi-sr-arrow-small-left flex items-center rounded-full bg-baigeLight p-1" />
        <span className="text-sm font-medium">Back</span>
      </button>
    </div>
  );
};

export default Header;
