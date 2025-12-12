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

  const [shouldShowText, setShouldShowText] = useState(true);
  const { user } = useAppSelector((state) => state.auth);

  // Determine the width class based on isOpen and device type
  const getWidthClass = () => {
    if (!isOpen) return 'w-16'; // Slightly wider for better icon spacing
    return isMobile ? 'w-64' : 'w-64';
  };

  useEffect(() => {
    if (isOpen && !isMobile) {
      setView(true);
      setShouldShowText(true);
    } else if (isMobile && !isOpen) {
      setView(false);
      setShouldShowText(false);
    } else {
      setView(true)
      setShouldShowText(true);
    }

  }, [isOpen, isMobile, shouldShowText]);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 p-3 mx-2 mb-2 transition-all duration-300 rounded-2xl group relative overflow-hidden ${isActive
      ? `bg-gradient-to-r from-logoBlue to-logoViolet text-white shadow-lg shadow-logoBlue scale-[1.02]`
      : `text-slate-500 hover:bg-slate-50 hover:text-logoSky hover:scale-[1.02]`
    }`;

  const iconClasses = (isActive: boolean, colorClass: string = "text-logoBlue") =>
    `h-6 w-6 flex items-center justify-center transition-colors duration-300 ${isActive ? 'text-white' : colorClass
    }`;

  return (
    <div className={`
      fixed lg:sticky bottom-0 left-0
      z-20 h-screen
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      transition-transform duration-300 ease-in-out
      ${!isMobile && "w-20"} flex-shrink-0
    `}>
      {view && (
        <aside
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="h-full"
        >
          <nav
            className={`
              fixed inset-y-0 left-0 ${getWidthClass()}
              bg-white backdrop-blur-xl border-r border-white shadow-xl
              transition-all duration-300 ease-in-out z-40 flex flex-col justify-between py-6
              ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : ''}
            `}
          >
            {/* Logo Area / Top Padding */}
            <div className={`h-16 flex items-center justify-start pt-16 px-6 pb-4 text-slate-600 text-base font-semibold duration-300 ${!isOpen && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
              👋 Hello, {user?.firstName}
            </div>

            <ul className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-hide">
              <li>
                <NavLink
                  to="/"
                  className={navLinkClasses}
                  onClick={onClose}
                >
                  {({ isActive }) => (
                    <div className="flex items-center gap-4">
                      <i className={`fi fi-sr-home ${iconClasses(isActive)}`} />
                      {shouldShowText && <span className="font-bold tracking-wide truncate">Home</span>}
                    </div>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/chats"
                  className={navLinkClasses}
                  onClick={onClose}
                >
                  {({ isActive }) => (
                    <div className="flex items-center gap-4">
                      <i className={`fi fi-sr-messages ${iconClasses(isActive)}`} />
                      {shouldShowText && <span className="font-bold tracking-wide truncate">Chats</span>}
                    </div>
                  )}
                </NavLink>
              </li>

              {user && user?.role == "student" && (
                <li>
                  <NavLink
                    to="/teachers"
                    className={navLinkClasses}
                    onClick={onClose}
                  >
                    {({ isActive }) => (
                      <div className="flex items-center gap-4">
                        <i className={`fi fi-sr-chalkboard-user ${iconClasses(isActive)}`} />
                        {shouldShowText && <span className="font-bold tracking-wide truncate">Teachers</span>}
                      </div>
                    )}
                  </NavLink>
                </li>
              )}
              {user?.role == "teacher" && (
                <li>
                  <NavLink
                    to="/students"
                    className={navLinkClasses}
                    onClick={onClose}
                  >
                    {({ isActive }) => (
                      <div className="flex items-center gap-4">
                        <i className={`fi fi-sr-student ${iconClasses(isActive)}`} />
                        {shouldShowText && <span className="font-bold tracking-wide truncate">Students</span>}
                      </div>
                    )}
                  </NavLink>
                </li>
              )}

              <li>
                <NavLink
                  to="/coachings"
                  className={navLinkClasses}
                  onClick={onClose}
                >
                  {({ isActive }) => (
                    <div className="flex items-center gap-4">
                      <i className={`fi fi-sr-graduation-cap ${iconClasses(isActive)}`} />
                      {shouldShowText && <span className="font-bold tracking-wide truncate">Coaching</span>}
                    </div>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/classrooms"
                  className={navLinkClasses}
                  onClick={onClose}
                >
                  {({ isActive }) => (
                    <div className="flex items-center gap-4">
                      <i className={`fi fi-sr-lesson ${iconClasses(isActive)}`} />
                      {shouldShowText && <span className="font-bold tracking-wide truncate">Classrooms</span>}
                    </div>
                  )}
                </NavLink>
              </li>
            </ul>

            {/* Bottom Section */}
            <ul className="space-y-1 mb-8 pt-4 border-t border-slate-100/50">
              <li>
                <NavLink
                  to="/documents"
                  className={navLinkClasses}
                  onClick={onClose}
                >
                  {({ isActive }) => (
                    <div className="flex items-center gap-4">
                      <i className={`fi fi-sr-book-alt ${iconClasses(isActive, "text-logoViolet")}`} />
                      {shouldShowText && <span className="font-bold tracking-wide truncate">Knowledge</span>}
                    </div>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-4 p-3 mx-2 mb-2 transition-all duration-300 rounded-2xl group relative overflow-hidden ${isActive
                      ? `bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg shadow-red-500/20 scale-[1.02]`
                      : `text-slate-500 hover:bg-red-50 hover:text-red-500 hover:scale-[1.02]`
                    }`
                  }
                  onClick={onClose}
                >
                  {({ isActive }) => (
                    <div className="flex items-center gap-4">
                      <i className={`fi fi-sr-settings ${iconClasses(isActive, "text-red-500")}`} />
                      {shouldShowText && <span className="font-bold tracking-wide truncate">Profile</span>}
                    </div>
                  )}
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
      )}
    </div>
  );
}
