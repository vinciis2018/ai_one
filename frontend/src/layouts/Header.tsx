import { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector, type RootState } from '../store';
import { getMe, logout } from '../store/slices/authSlice';

interface HeaderProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (isSidebarOpen: boolean) => void;
  bg?: string
}

export function Header({ onMenuClick, isMobile, setIsSidebarOpen, isSidebarOpen,  bg="bg-white" }: HeaderProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  // Close dropdown when clicking outside
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMe()).unwrap();
    }
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuClick = () => {
    console.log('clicked')
    if (onMenuClick) onMenuClick();
    else setIsSidebarOpen?.(!isSidebarOpen);
  };

  return (
    <header className={`fixed py-2 top-0 left-0 right-0 z-50 shadow-xs ${bg}`}>
      <div className="h-full mx-auto px-6 flex items-center justify-between">
        {/* Mobile menu button */}
        {isMobile && (
          <button 
            type="button"
            onClick={handleMenuClick}
            className="p-1 rounded-md bg-white text-[var(--text)] hover:bg-[var(--background)] focus:outline-none"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <i className="fi fi-sr-x w-6 h-6 text-[var(--text)] flex items-center justify-center" />
            ) : (
              <i className="fi fi-br-menu-burger w-6 h-6 text-[var(--text)] flex items-center justify-center" />
            )}
          </button>
        )}
        <div className="flex items-center cursor-pointer" onClick={() => isAuthenticated ? navigate('/') : navigate('/')}>
          {isMobile ? (
            <div className="flex items-center">
              {/* <div className="border-2 border-green rounded-full flex items-center">
                <h1 className="text-green text-xl font-semibold px-1.5 py-0.5">m</h1>
              </div> */}
              <h1 className="text-green text-xl font-semibold">maiind</h1>
            </div>
          ) : (
            <div className="h-8 flex items-center gap-1">
              <h1 className="text-green text-xl font-semibold">maiind</h1>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 py-2">
          {/* Avatar with Dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                title="User menu"
                type="button"
                onClick={toggleDropdown}
                className="h-10 w-10 flex items-center justify-center bg-white text-[var(--text)] font-medium text-sm cursor-pointer hover:opacity-90 transition-opacity rounded-full border border-[var(--border)]"
                aria-haspopup="menu"
                // aria-expanded={isDropdownOpen}
                aria-label="User menu"
              >
                <img src={user.avatar} alt={user.firstName} className="p-2 flex items-center justify-center rounded-full" />
              </button>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className={`absolute right-0 mt-4 w-56 rounded-md shadow-lg bg-white dark:bg-black ring-1 ring-black ring-opacity-5 focus:outline-none z-60`}>
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="text-sm text-[var(--text)]">Signed in as</p>
                      <p className="text-sm font-medium text-[var(--text)] truncate">{user.email}</p>
                    </div>
                    <a
                      href=""
                      onClick={() => navigate('/profile')}
                      className="flex items-center px-4 py-2 text-sm text-green hover:bg-[var(--background-alt)]"
                      role="menuitem"
                    >
                      <i className="fi fi-sr-user mr-3 h-5 w-5 flex items-center justify-center"></i>
                      Your Profile
                    </a>

                    <div className="border-t border-[var(--border)] my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        // Add your sign out logic here
                        dispatch(logout());
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-[var(--background-alt)]"
                      role="menuitem"
                    >
                      <i className="fi fi-sr-leave mr-3 h-5 w-5 text-[var(--text-muted)] flex items-center justify-center"></i>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative pr-2" ref={dropdownRef}>
              <button 
                title="User menu"
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center justify-center bg-green text-white font-medium text-sm cursor-pointer hover:opacity-90 transition-opacity rounded-full border border-[var(--border)] px-4 py-2 gap-2"
                aria-haspopup="menu"
                aria-label="User menu"
              >
                <i className="fi fi-br-sign-in-alt flex items-center justify-center text-white"></i>
                Get In
              </button>
            </div>
          )}


{/* 
          {!isMobile && !isSidebarOpen && (
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
          )} */}
          
        </div>
      </div>
    </header>
  );
}
