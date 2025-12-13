import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { googleLogin } from '../../store/slices/authSlice';
import { logo } from '../../assets';
import { useGoogleLogin } from '@react-oauth/google';
import { NoLayout } from '../../layouts/AppLayout';

export const AuthPage = () => {
  const { loading, error } = useAppSelector((state) => state.auth);

  return (
    <NoLayout>
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-black p-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-logoBlue/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-logoViolet/20 rounded-full blur-[100px]" />
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl border border-white/50 dark:border-slate-800 relative z-10 transition-all hover:shadow-logoBlue/10">
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Sheepmate Logo"
              className="h-16 w-16 mx-auto mb-4 bg-white/10 rounded-2xl p-2 shadow-sm"
            />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Sheepmate</h1>
            <p className="text-slate-500 dark:text-slate-400">Sign in to streamline your shipment data</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-500 text-sm p-4 rounded-xl mb-6 flex items-center gap-3">
              <i className="fi fi-br-exclamation flex items-center justify-center"></i>
              {error}
            </div>
          )}

          <div className="flex justify-center flex-col items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2 text-logoBlue font-bold">
                <div className="w-5 h-5 border-3 border-logoBlue/30 border-t-logoBlue rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <CustomGoogleLoginButton />
            )}
          </div>
        </div>
      </div>
    </NoLayout>
  );
};

const CustomGoogleLoginButton = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log(tokenResponse);
      if (tokenResponse.access_token) {
        dispatch(googleLogin(tokenResponse.access_token)).then((result) => {
          console.log(result);
          if (googleLogin.fulfilled.match(result)) {
            navigate('/');
          }
        });
      }
    },
    onError: () => console.log('Login Failed'),
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
  });

  return (
    <button
      onClick={() => login()}
      className="flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-6 py-3 rounded-full font-bold shadow-sm hover:shadow-md transition-all duration-200 w-full max-w-[280px]"
    >
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
      <span>Sign in with Google</span>
    </button>
  );
};
