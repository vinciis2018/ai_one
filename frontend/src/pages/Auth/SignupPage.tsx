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

  const {user, isAuthenticated} = useAppSelector((state) => state.auth);
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
  },[isAuthenticated, user, navigate])


  return (
    <SimpleLayout>
      <div className="w-full max-w-sm mx-auto py-16 space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-center text-violet">
            Create a new account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-[var(--text-muted)] bg-[var(--background)] placeholder-[var(--text-muted)] text-[var(--text)] focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-[var(--text-muted)] bg-[var(--background)] placeholder-[var(--text-muted)] text-[var(--text)] focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value, username: e.target.value.split("@")[0] })}
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
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-[var(--text-muted)] bg-[var(--background)] placeholder-[var(--text-muted)] text-[var(--text)] focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-[var(--text-muted)] bg-[var(--background)] placeholder-[var(--text-muted)] text-[var(--text)] focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                Role *
              </label>
              <div className="space-y-2">
                <select
                  title={formData.role}
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                >
                  <option value="default">Select a role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="organisation">Organisation</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--text-muted)] rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-[var(--text-muted)]">
              I agree to the <a href="#" className="text-violet hover:text-[var(--primary-hover)]">Terms and Conditions</a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet hover:border-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-[var(--text-muted)]">Already have an account? </span>
          <a href="/login" className="font-medium text-black dark:text-white hover:border-primary">
            Sign in
          </a>
        </div>
      </div>
    </SimpleLayout>
  );
}

export default SignupPage;
