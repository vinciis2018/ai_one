import { useEffect } from 'react';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import App from './App';

// Type definitions for service worker config
type ServiceWorkerConfig = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

function AppWithServiceWorker() {
  useEffect(() => {
    // Register service worker for PWA in production
    if (import.meta.env.PROD) {
      try {
        const config: ServiceWorkerConfig = {
          onSuccess: (registration: ServiceWorkerRegistration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          onUpdate: (registration: ServiceWorkerRegistration) => {
            if (registration.waiting) {
              // If there's an update, show a notification to the user
              if (window.confirm('A new version is available! Would you like to update?')) {
                // Post message to skip waiting
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                
                // Reload when the new service worker takes over
                const reloadPage = () => window.location.reload();
                navigator.serviceWorker.addEventListener('controllerchange', reloadPage, { once: true });
              }
            }
          }
        };

        // Register service worker with proper typing
        serviceWorkerRegistration.register(config);
      } catch (error) {
        console.error('Error in service worker setup: ', error);
      }
    }
  }, []);

  return <App />;
}

export default AppWithServiceWorker;
