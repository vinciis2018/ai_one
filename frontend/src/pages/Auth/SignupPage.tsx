import { useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
import { signup } from '../../store/slices/authSlice';
import { useEffect, useState } from 'react';
import { SimpleLayout } from '../../layouts/AppLayout';
import type { UserRegistrationFormData } from '../../types';
import { useAppSelector, type AppDispatch } from '../../store';
import { useNavigate } from 'react-router-dom';


export function SignupPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState<UserRegistrationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "default",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(signup(formData));
      console.log(resultAction);
    } catch (error) {
      console.error('Signup failed:', error);
      // Handle error (e.g., show error message)
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log(user)
      navigate('/');
    }
  }, [isAuthenticated, user, navigate])


  return (
    <SimpleLayout>
      <div className="min-h-[calc(100vh-64px)] w-full relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-logoBlue/10 dark:from-background dark:via-background dark:to-logoBlue/5 py-16">
        <div className="w-full max-w-lg mx-auto relative z-10 px-4">
          <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 transform transition-all hover:scale-[1.005] duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent inline-block">
                Create Account
              </h2>
              <p className="mt-2 text-[var(--text-muted)] text-sm">
                Join us today and get started
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSignup}>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text)] mb-1.5 ml-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/50 text-[var(--text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logoBlue/50 focus:border-logoBlue transition-all duration-200 backdrop-blur-sm"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text)] mb-1.5 ml-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/50 text-[var(--text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logoBlue/50 focus:border-logoBlue transition-all duration-200 backdrop-blur-sm"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-1.5 ml-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/50 text-[var(--text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logoBlue/50 focus:border-logoBlue transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value, username: e.target.value.split("@")[0] })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] mb-1.5 ml-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/50 text-[var(--text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logoBlue/50 focus:border-logoBlue transition-all duration-200 backdrop-blur-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text)] mb-1.5 ml-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/50 text-[var(--text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-logoBlue/50 focus:border-logoBlue transition-all duration-200 backdrop-blur-sm"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-[var(--text)] mb-1.5 ml-1">
                  Role
                </label>
                <div className="relative">
                  <select
                    title={formData.role}
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/50 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-logoBlue/50 focus:border-logoBlue transition-all duration-200 backdrop-blur-sm appearance-none"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center ml-1">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-logoBlue focus:ring-logoBlue border-gray-300 rounded cursor-pointer transition-colors"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-[var(--text-muted)]">
                  I agree to the <a href="#" className="font-medium text-logoViolet hover:text-logoBlue transition-colors">Terms and Conditions</a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-logoBlue to-logoViolet hover:shadow-lg hover:shadow-logoBlue/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-logoBlue"
              >
                Create Account
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
                Already have an account?{' '}
                <a href="/login" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-logoBlue to-logoViolet hover:opacity-80 transition-opacity">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
}

export default SignupPage;
