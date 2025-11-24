import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { ThemeProvider } from './context/ContextProvider/ThemeProvider';
import { HomePage, LoginPage, SignupPage, NotFoundPage, UserProfilePage, LandingPage, DocumentsPage, DocumentDetailsPage, ConversationsPage, CoachingsPage, CoachingDetailsPage, TeachersForStudentPage, TeacherProfilePage, StudentProfilePage, NotesPage, ChatsPage, TeacherChatPage, StudentsForTeacherPage } from './pages';
import { getMe } from './store/slices/authSlice';
import { useEffect } from 'react';
import NeuronAnimation from './components/NeuronAnimation';

function AppContent() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMe()).unwrap();
    }
  }, [dispatch]);
  return (
    <div className={`min-h-screen relative`}>
      <NeuronAnimation />
      <div className="relative">
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
            <Route path="/documents/:id" element={<DocumentDetailsPage />} />
            <Route path="/conversations" element={<ConversationsPage />} />
            <Route path="/coachings" element={<CoachingsPage />} />
            <Route path="/coachings/:id" element={<CoachingDetailsPage />} />
            <Route path="/teachers" element={<TeachersForStudentPage />} />
            <Route path="/students" element={<StudentsForTeacherPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/teacher/chats/:teacher_user_id/:student_user_id" element={<TeacherChatPage />} />
            <Route path="/teacher/profile/:user_id" element={<TeacherProfilePage />} />
            <Route path="/student/profile/:user_id" element={<StudentProfilePage />} />

            {/* No Route */}
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
