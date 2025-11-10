import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { ThemeProvider } from './context/ContextProvider/ThemeProvider';
import { HomePage, LoginPage, SignupPage, NotFoundPage, UserProfilePage, LandingPage, DocumentsPage, ConversationsPage, CoachingsPage, TeachersForStudentPage, NotesPage, ChatsPage, TeacherChatPage, StudentsForTeacherPage } from './pages';
import { getMe } from './store/slices/authSlice';
import { useEffect } from 'react';

function AppContent() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMe()).unwrap();
    }
  }, [dispatch]);
  return (
    <div className={`min-h-screen`}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          
          {/* Public Route */}
          <Route path="/" element={<HomePage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/conversations" element={<ConversationsPage />} />
          <Route path="/coachings" element={<CoachingsPage />} />
          <Route path="/teachers" element={<TeachersForStudentPage />} />
          <Route path="/students" element={<StudentsForTeacherPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/teacher/chats/:teacher_user_id/:student_user_id" element={<TeacherChatPage />} />
         
          {/* No Route */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </BrowserRouter>
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
