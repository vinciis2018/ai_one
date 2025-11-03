import { NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../store';
interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen = false, onClose, isMobile = false, setIsOpen }: SidebarProps) {
  const { theme } = useTheme();

  const [view, setView] = useState(true);
  
  const { user } = useAppSelector((state) => state.auth);

  // Determine the width class based on isOpen and device type
  const getWidthClass = () => {
    if (!isOpen) return 'w-16';
    return isMobile ? 'w-48' : 'w-48';
  };
  
  // Determine if we should show text (always show on desktop, only when open on mobile)
  const shouldShowText = !isMobile || isOpen;

  useEffect(() => {
    if (isOpen && !isMobile) {
      setView(true);
    } else if (isMobile && !isOpen) {
      setView(false);
    } else {
      setView(true)
    }
  },[isOpen,isMobile]);

  return (
    <div className={`
      fixed lg:sticky top-16 bottom-0 left-0 h-[calc(100vh-1rem)]
      bg-[var(--background-alt)] z-10
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      transition-transform duration-300 ease-in-out
      ${!isMobile && "w-16"} flex-shrink-0
    `}>
      {view && (
        <aside onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)} className="overflow-y-auto h-full">
          <nav 
            className={`py-2 pl-2 pr-3 fixed inset-y-0 left-0 border-r ${getWidthClass()} 
            ${theme === "dark" ? "bg-black" : "bg-white"}
            transition-all duration-300 ease-in-out mt-16 mb-8 z-40 flex flex-col justify-between`}
          >
            <ul className="ml-1 space-y-1">
              <li className="">
                <NavLink
                  to="/products"
                  className={({ isActive }) => 
                    `flex items-center gap-3 p-3 transition-colors ${
                      isActive 
                        ? `border-l-2 rounded-l-lg bg-[var(--primary)] font-bold ${theme === 'dark' ? 'text-white' : 'text-text'}`
                        : `rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-text hover:bg-gray-100'}`
                    }`
                  }
                  onClick={onClose}
                >
                  <i className="fi fi-sr-home h-5 w-5 text-text flex items-center justify-center" />
                  {shouldShowText && <span className="truncate">Home</span>}
                </NavLink>
              </li>
              {user && user?.role === "admin" && (
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) => 
                      `flex items-center gap-3 p-3 transition-colors ${
                        isActive 
                          ? `border-l-2 rounded-l-lg bg-[var(--primary)] font-bold ${theme === 'dark' ? 'text-white' : 'text-text'}`
                          : `rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-text hover:bg-gray-100'}`
                      }`
                    }
                    onClick={onClose}
                  >
                    <i className="fi fi-sr-dashboard h-5 w-5 text-text flex items-center justify-center" />
                    {shouldShowText && <span className="truncate">Dashboard</span>}
                  </NavLink>
                </li>
              )}
              
              <li>
                <NavLink
                  to="/products"
                  className={({ isActive }) => 
                    `flex items-center gap-3 p-3 transition-colors ${
                      isActive 
                        ? `border-l-2 rounded-l-lg bg-[var(--primary)] font-bold ${theme === 'dark' ? 'text-white' : 'text-text'}`
                        : `rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-text hover:bg-gray-100'}`
                    }`
                  }
                  onClick={onClose}
                >
                  <i className="fi fi-br-computer h-5 w-5 text-text flex items-center justify-center" />
                  {shouldShowText && <span className="truncate">Products</span>}
                </NavLink>
              </li>

              {user && user?.role === "admin" && (
                <li>
                  <NavLink
                    to="/distributors"
                    className={({ isActive }) => 
                      `flex items-center gap-3 p-3 transition-colors ${
                        isActive 
                          ? `border-l-2 rounded-l-lg bg-[var(--primary)] font-bold ${theme === 'dark' ? 'text-white' : 'text-text'}`
                          : `rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-text hover:bg-gray-100'}`
                      }`
                    }
                    onClick={onClose}
                  >
                    <i className="fi fi-br-computer h-5 w-5 text-text flex items-center justify-center" />
                    {shouldShowText && <span className="truncate">Distributors</span>}
                  </NavLink>
                </li>
              )}

              {user && ["admin", "rte"].includes(user?.role) && (
                <li>
                  <NavLink
                    to="/Retailers"
                    className={({ isActive }) => 
                      `flex items-center gap-3 p-3 transition-colors ${
                        isActive 
                          ? `border-l-2 rounded-l-lg bg-[var(--primary)] font-bold ${theme === 'dark' ? 'text-white' : 'text-text'}`
                          : `rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-text hover:bg-gray-100'}`
                      }`
                    }
                    onClick={onClose}
                  >
                    <i className="fi fi-br-computer h-5 w-5 text-text flex items-center justify-center" />
                    {shouldShowText && <span className="truncate">Retailers</span>}
                  </NavLink>
                </li>
              )}

              <li>
                <NavLink
                  to="/orders"
                  className={({ isActive }) => 
                    `flex items-center gap-3 p-3 transition-colors ${
                      isActive 
                        ? `border-l-2 rounded-l-lg bg-[var(--primary)] font-bold ${theme === 'dark' ? 'text-white' : 'text-text'}`
                        : `rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-text hover:bg-gray-100'}`
                    }`
                  }
                  onClick={onClose}
                >
                  <i className="fi fi-br-computer h-5 w-5 text-text flex items-center justify-center" />
                  {shouldShowText && <span className="truncate">Orders</span>}
                </NavLink>
              </li>
              
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) => 
                    `flex items-center gap-3 p-3 transition-colors ${
                      isActive 
                        ? `border-l-2 rounded-l-lg bg-[var(--primary)] font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`
                        : `rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`
                    }`
                  }
                  onClick={onClose}
                >
                  <i className="fi fi-sr-settings h-5 w-5 text-[var(--text-muted)] flex items-center justify-center" />
                  {shouldShowText && <span className="truncate">Settings</span>}
                </NavLink>
              </li>
            </ul>
            {/* {isMobile && (
              <ul>
                <li className='p-3 transition-colors'>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex justify-start p-2 w-full rounded-lg bg-[var(--primary)] text-[var(--text)] hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  >
                    {theme === 'dark' ? '🌞' : '🌙'}
                    {shouldShowText && <span className="truncate px-2">{theme === 'dark' ? 'Dark' : 'Night'}</span>}
                  </button>
                </li>
              </ul>
            )} */}

          </nav>
        </aside>
      )}
    </div>
  );
}
