import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { ThemeProvider } from './contexts/ContextProvider/ThemeProvider';
import { LandingPage, NotFoundPage, AuthPage, ShipmentProcessor, EmailsPage } from './pages';
import { initializeAuth } from './store/slices/authSlice';
import { useEffect } from 'react';
import NeuronAnimation from './components/NeuronAnimation';

function AppContent() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);
  return (
    <div className={`min-h-screen relative`}>
      <NeuronAnimation />
      <div className="relative">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/emails" element={<EmailsPage />} />
            <Route path="/shipment-processor" element={<ShipmentProcessor />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
