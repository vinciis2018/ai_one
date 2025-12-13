// This service worker registration is compatible with Vite PWA plugin
// It provides a simple wrapper around the Vite PWA registration

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config) {
  if ('serviceWorker' in navigator) {
    // Vite PWA handles the service worker registration automatically
    // We just need to set up the update notification
    const handleUpdated = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        // If there's a waiting service worker, it means an update is available
        if (config?.onUpdate) {
          config.onUpdate(registration);
        } else {
          console.log('New content is available; please refresh.');
        }
      } else if (registration.active) {
        // Service worker is active and ready
        if (config?.onSuccess) {
          config.onSuccess(registration);
        } else {
          console.log('Content is cached for offline use.');
        }
      }
    };

    // Listen for the controllerchange event which is fired when a new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    // Check if the service worker is already registered
    navigator.serviceWorker.ready.then((registration) => {
      handleUpdated(registration);
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
