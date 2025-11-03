declare module 'serviceWorkerRegistration' {
  export interface Config {
    onSuccess?: (registration: ServiceWorkerRegistration) => void;
    onUpdate?: (registration: ServiceWorkerRegistration) => void;
  }

  const serviceWorkerRegistration: {
    register: (config?: Config) => void;
    unregister: () => void;
  };

  export default serviceWorkerRegistration;
}
