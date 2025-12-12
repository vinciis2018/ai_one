import { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector, type RootState } from '../store';
import { getMe, logout } from '../store/slices/authSlice';
import { maiindlogo, logo } from '../assets';

interface HeaderProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (isSidebarOpen: boolean) => void;
  bg?: string
}

export function Header({ onMenuClick, isMobile, setIsSidebarOpen, isSidebarOpen, bg = "bg-white" }: HeaderProps) {
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
      <div className="h-full mx-auto px-3 lg:px-6 flex items-center justify-between">
        {/* Mobile menu button */}
        {isMobile && (
          <button
            type="button"
            onClick={handleMenuClick}
            className="p-2.5 rounded-md bg-white text-lg hover:bg-[var(--background)] focus:outline-none"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <i className="fi fi-sr-x flex items-center justify-center" />
            ) : (
              <i className="fi fi-br-menu-burger flex items-center justify-center" />
            )}
          </button>
        )}
        <div className="flex items-center cursor-pointer" onClick={() => isAuthenticated ? navigate('/') : navigate('/')}>
          {isMobile ? (
            <div className="flex items-center">
              {/* <div className="border-2 border-green rounded-full flex items-center">
                <h1 className="text-green text-xl font-semibold px-1.5 py-0.5">m</h1>
              </div> */}
              <img src={logo} alt="maiind" className="h-12 w-12" />
              {/* <span className="text-xs text-sky-500 px-1 rounded-full mt-4 -mr-4 border border-sky-500">{"\u03B2"}</span> */}
            </div>
          ) : (
            <div className="h-8 flex items-center">
              <img src={maiindlogo} alt="maiind" className="h-8 w-16" />
              {/* <span className="text-xs text-sky-500 px-1 rounded-full mt-12 -ml-1 border border-sky-500">{"\u03B2"}</span> */}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 py-2">
          <p className="text-xs font-semibold hidden sm:block">{user?.firstName} {user?.role === "teacher" ? "Sir" : null}</p>
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
                <div className="absolute right-0 mt-4 w-72 transform origin-top-right transition-all duration-200 ease-out z-50">
                  <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-white shadow-2xl rounded-3xl overflow-hidden ring-1 ring-logoBlue">

                    {/* Cloud Header Decoration */}
                    <div className="bg-gradient-to-br from-logoBlue via-logoBlue to-logoViolet relative overflow-hidden p-3 lg:p-6 flex flex-col justify-end">
                      <div className="absolute top-[-50%] left-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-[-20%] right-[-10%] w-32 h-32 bg-logoViolet/30 rounded-full blur-2xl"></div>

                      <p className="relative z-10 text-xs font-bold text-white uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="relative z-10 text-white font-bold text-lg truncate drop-shadow-sm">{user.firstName} {user.lastName}</p>
                      <p className="relative z-10 text-white text-xs truncate">{user.email}</p>
                    </div>

                    <div className="py-2" role="menu">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-3 lg:px-6 py-2 lg:py-4 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                        role="menuitem"
                      >
                        <div className="w-10 h-10 rounded-xl bg-logoBlue/10 text-logoBlue flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <i className="fi fi-rr-user text-lg flex items-center justify-center"></i>
                        </div>
                        <div className="flex-1 text-left">
                          <span className="block text-slate-900 dark:text-white">My Profile</span>
                          <span className="text-xs text-slate-500 font-medium">Manage your account</span>
                        </div>
                        <i className="fi fi-rr-angle-small-right text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-white/10 my-1 mx-6"></div>

                      <button
                        type="button"
                        onClick={() => {
                          dispatch(logout());
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-3 lg:px-6 py-2 lg:py-4 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
                        role="menuitem"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <i className="fi fi-rr-sign-out-alt text-lg flex items-center justify-center ml-1"></i>
                        </div>
                        <div className="flex-1 text-left">
                          <span className="block">Sign Out</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                title="User menu"
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-full px-2 lg:px-4 py-2 gap-2 flex items-center justify-center text-white font-medium text-sm cursor-pointer bg-gradient-to-r from-logoBlue to-logoViolet hover:shadow-lg hover:shadow-logoBlue/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-logoBlue"
                aria-haspopup="menu"
                aria-label="User menu"
              >
                <i className="fi fi-br-sign-in-alt flex items-center justify-center text-white"></i>
                <span className="hidden sm:block">Get In</span>
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
