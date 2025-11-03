import Tooltip from '@mui/material/Tooltip';
import { useState, type ReactNode } from 'react';

export interface TabItem {
  value: string;
  text: string;
  icon?: ReactNode;
  label?: string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  showChevron?: boolean;
}

export const Tabs = ({
  items,
  value,
  onChange,
  className = '',
  tabClassName = '',
  activeTabClassName = 'border-violet text-violet',
  showChevron = false,
}: TabsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeTab = items.find((tab) => tab.value === value) || items[0];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleTabClick = (tabValue: string) => {
    onChange(tabValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Mobile/Compact View */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={toggleDropdown}
          className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md ${tabClassName} ${
            isOpen ? 'rounded-b-none' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            {activeTab.icon && <span className="text-base">{activeTab.icon}</span>}
            <span>{activeTab.text}</span>
          </div>
          {showChevron && (
            <span className="ml-2">
              {isOpen ? <i className="fi fi-br-chevron-up flex items-center" /> : <i className="fi fi-br-chevron-down flex items-center" />}
            </span>
          )}
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-b-md shadow-lg border border-gray-200">
            {items.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabClick(tab.value)}
                className={`flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                  value === tab.value ? 'bg-gray-100' : ''
                }`}
              >
                {tab.icon && <span className="mr-2 text-sm">{tab.icon}</span>}
                {tab.text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <nav className="flex space-x-4">
          {items.map((tab) => {
            const isActive = value === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabClick(tab.value)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  isActive
                    ? `border-violet text-violet ${activeTabClassName}`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${tabClassName}`}
              >
                <Tooltip title={`${tab.label}`}>
                  <span className="flex items-center gap-1">
                    {tab.icon && <span className="text-sm">{tab.icon}</span>}
                    {tab.text !== "" ? tab.text : null}
                  </span>
                </Tooltip>
          
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Tabs;
