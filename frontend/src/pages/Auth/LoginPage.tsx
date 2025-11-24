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
  },[navigate, isAuthenticated])

  return (
    <SimpleLayout>
      <div className="w-full max-w-sm mx-auto space-y-4 py-16 px-8">
        <div>
          <h2 className="text-3xl font-bold text-center text-green2">
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-[var(--text-muted)] bg-[var(--background)] placeholder-[var(--text-muted)] text-[var(--text)] focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-[var(--text-muted)] bg-[var(--background)] placeholder-[var(--text-muted)] text-[var(--text)] focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--text-muted)] rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--text)]">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              {/* <a href="/forgot-password" className="font-medium text-green hover:text-[var(--primary-hover)]"> */}
              <a className="font-medium text-green2 hover:text-[var(--primary-hover)]">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green2 hover:border-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-[var(--text-muted)]">Don't have an account? </span>
          <a href="/signup" className="font-medium text-black dark:text-white">
            Sign up
          </a>
        </div>
      </div>
    </SimpleLayout>
  );
}
