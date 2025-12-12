import { useEffect, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useDeviceType } from '../hooks/useDevice';
import { FloatingChatButton } from '../components/molecules/FloatingChatButton';
import { ChatSlidePanel } from '../components/molecules/ChatSlidePanel';

interface FullLayoutProps {
  children: React.ReactNode | ((props: {
    selectedData: string | null;
    setSelectedData: React.Dispatch<React.SetStateAction<string | null>>
    selectedDocument: string | null;
    setSelectedDocument: React.Dispatch<React.SetStateAction<string | null>>
    setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>
  }) => React.ReactNode);
  footer?: React.ReactNode | null;
}

export function FullLayout({ children, footer = null }: FullLayoutProps) {
  const { isMobile } = useDeviceType();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);


  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  useEffect(() => {
    if (selectedData) {
      setIsChatOpen(true);
    }
  }, [selectedData]);
  return (
    <div className="text-[var(--text)] flex flex-col h-screen overflow-hidden">
      {/* Fixed Header */}
      <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isMobile={isMobile} />

      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar - Fixed on mobile, sticky on desktop */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} isMobile={isMobile} setIsOpen={setIsSidebarOpen} />
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative w-full">
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto w-full scroll-smooth">
            <div className="relative min-h-full">
              {typeof children === 'function' ? children({ selectedData, setSelectedData, selectedDocument, setSelectedDocument, setIsChatOpen }) : children}
            </div>
          </main>

        </div>
      </div>
      {/* Footer */}
      <Footer className="">
        {footer}
      </Footer>

      {/* Floating Chat Interface */}
      <FloatingChatButton onClick={toggleChat} isOpen={isChatOpen} />
      <ChatSlidePanel
        chatId={""}
        isOpen={isChatOpen}
        onClose={closeChat}
        setSelectedData={setSelectedData}
        selectedData={selectedData}
        setSelectedDocument={setSelectedDocument}
        selectedDocument={selectedDocument}
      />

    </div>
  );
}

interface SimpleLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode | null;
}

export function SimpleLayout({ children, footer = null }: SimpleLayoutProps) {
  const { isMobile } = useDeviceType();

  return (
    <div className="min-h-screen text-[var(--text)]">
      {/* Fixed Header */}
      <Header bg="bg-transparent" onMenuClick={() => { }} isSidebarOpen={false} setIsSidebarOpen={() => { }} isMobile={isMobile} />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-[calc(100vh-6rem)]">
            {children}
          </div>
        </main>
      </div>
      {/* Footer */}
      <Footer className="bg-white">
        {footer}
      </Footer>
    </div>
  );
}

interface NoLayoutProps {
  children: React.ReactNode;
}

export function NoLayout({ children }: NoLayoutProps) {
  return (
    <div className="min-h-screen">
      <main className="relative w-full">
        {children}
      </main>
    </div>
  );
}

