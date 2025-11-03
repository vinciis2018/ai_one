import { useEffect, useState } from "react";

export const useDeviceType = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isInStandaloneMode = () =>
      (window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as unknown as { standalone: boolean }).standalone ||
      document.referrer.includes('android-app://');

    // Check screen width for mobile devices
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 768; // Common breakpoint for mobile
      setIsMobile(isMobileView);
      
      // If in standalone mode (PWA), we might want to handle it differently
      const standalone = isInStandaloneMode();
      setIsStandalone(standalone);
      
      return () => window.removeEventListener('resize', checkMobile);
    };

    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, isStandalone };
};
