import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@flaticon/flaticon-uicons/css/all/all.css';
import { ThemeProvider } from './context/ContextProvider/ThemeProvider';
import AppWithServiceWorker from './AppWithServiceWorker';
import { userInfoFromLocalStorage } from './store';
// import { AppProvider } from './context/ContextProvider/AppProvider';

const root = createRoot(document.getElementById('root')!);
userInfoFromLocalStorage();
root.render(
  <StrictMode>
    <ThemeProvider>
      {/* <AppProvider> */}
        <AppWithServiceWorker />
      {/* </AppProvider> */}
    </ThemeProvider>
  </StrictMode>
);
