import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../store/slices/authSlice';
import { SimpleLayout } from '../../layouts/AppLayout';
import { useEffect, useState } from 'react';
import type { UserLoginFormData } from '../../types';
import { useAppSelector, type AppDispatch, type RootState } from '../../store';

export function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserLoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const resultAction = await dispatch(login(formData));
      if (login.fulfilled.match(resultAction)) {
        // Login successful, navigate to dashboard or home
        navigate('/');
      } else if (login.rejected.match(resultAction)) {
        setError(resultAction.error.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An error occurred during login');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [navigate, isAuthenticated])

  return (
    <SimpleLayout>
      <div className="min-h-[calc(100vh-64px)] w-full relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-logoBlue/10 dark:from-background dark:via-background dark:to-logoBlue/5 py-20">
        <div className="w-full max-w-md mx-auto relative z-10 px-4 bg-white">
          <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 transform transition-all hover:scale-[1.01] duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent inline-block">
                Welcome Back
              </h2>
              <p className="mt-2 text-[var(--text-muted)] text-sm">
                Sign in to continue to your dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50/80 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center shadow-sm backdrop-blur-sm">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-1.5 ml-1">
                    Email address
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/50 text-[var(--text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logoBlue/50 focus:border-logoBlue transition-all duration-200 group-hover:border-logoBlue/50 backdrop-blur-sm"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/50 text-[var(--text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logoBlue/50 focus:border-logoBlue transition-all duration-200 group-hover:border-logoBlue/50 backdrop-blur-sm"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-logoBlue focus:ring-logoBlue border-gray-300 rounded cursor-pointer transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--text-muted)] cursor-pointer select-none">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="/forgot-password" className="font-medium text-logoViolet hover:text-logoBlue transition-colors duration-200">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-logoBlue to-logoViolet hover:shadow-lg hover:shadow-logoBlue/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-logoBlue disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign In
              </button>
            </form>

            {/* Animated Background Blobs */}
            <div className="relative h-full mt-8 flex justify-center">
              <div className="w-6 h-6 rounded-full bg-logoBlue blur-[100px] animate-bounce  mix-blend-multiply dark:mix-blend-lighten filter opacity-20" />
              <div className="w-6 h-6 -mt-1 rounded-full bg-logoViolet blur-[100px] animate-pulse delay-1000 mix-blend-multiply dark:mix-blend-lighten filter opacity-20" />
              <div className="w-6 h-6 rounded-full bg-logoSky blur-[80px] animate-bounce delay-700 mix-blend-multiply dark:mix-blend-lighten filter opacity-20" />
            </div>
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Don't have an account?{' '}
                <a href="/signup" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-logoBlue to-logoViolet hover:opacity-80 transition-opacity">
                  Sign up now
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
}
