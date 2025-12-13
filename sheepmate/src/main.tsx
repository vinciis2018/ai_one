import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@flaticon/flaticon-uicons/css/all/all.css';
import { ThemeProvider } from './contexts/ContextProvider/ThemeProvider';
import AppWithServiceWorker from './AppWithServiceWorker';

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AppWithServiceWorker />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
