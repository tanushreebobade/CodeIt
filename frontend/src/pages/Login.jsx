import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser, clearError } from "../authSlice";
import { useEffect, useState } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthRightSection from '../components/AuthRightSection';
import CodeItRocketLogo from '../components/CodeItRocketLogo';

const loginSchema = z.object({
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      const redirectToParam = params.get('redirectTo');
      const savedRedirect = sessionStorage.getItem('redirectAfterAuth');
      const targetUrl = redirectToParam || savedRedirect || '/';
      sessionStorage.removeItem('redirectAfterAuth');
      navigate(targetUrl, { replace: true });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');
    if (oauthError) {
      toast.error(oauthError, { id: 'oauth-error' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = async (data) => {
    const resultAction = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(resultAction)) {
      const params = new URLSearchParams(window.location.search);
      const redirectToParam = params.get('redirectTo');
      const savedRedirect = sessionStorage.getItem('redirectAfterAuth');
      const targetUrl = redirectToParam || savedRedirect || '/';
      sessionStorage.removeItem('redirectAfterAuth');
      navigate(targetUrl, { replace: true });
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      window.location.href = 'http://localhost:3000/auth/google';
    } else if (provider === 'GitHub') {
      window.location.href = 'http://localhost:3000/auth/github';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-5 flex flex-col justify-between py-2 px-1 sm:px-4">
          <div className="mb-8">
            <NavLink to="/" className="inline-flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-xl tracking-tight group">
              <CodeItRocketLogo className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight font-heading">CodeIt</span>
            </NavLink>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
              Login to your account
            </h1>
          </div>

          {error && (
            <div className="p-3 bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-[6px] mb-5 flex items-center gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-neutral-400" />
              <span>{typeof error === 'string' ? error : (error?.message || 'Invalid Email or Password')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="mail@example.com"
                className={`w-full bg-[var(--bg-secondary)] border ${
                  errors.emailId ? 'border-neutral-500' : 'border-[var(--border-subtle)] focus:border-neutral-400'
                } text-[var(--text-primary)] text-sm rounded-[6px] px-3.5 py-2.5 placeholder-[var(--text-muted)] focus:outline-none transition-all duration-200`}
                {...register('emailId')}
              />
              {errors.emailId && (
                <span className="text-neutral-400 text-xs mt-1.5 block font-medium">
                  {errors.emailId.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full bg-[var(--bg-secondary)] border ${
                    errors.password ? 'border-neutral-500' : 'border-[var(--border-subtle)] focus:border-neutral-400'
                  } text-[var(--text-primary)] text-sm rounded-[6px] px-3.5 py-2.5 pr-11 placeholder-[var(--text-muted)] focus:outline-none transition-all duration-200`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-neutral-400 text-xs mt-1.5 block font-medium">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm py-2.5 rounded-[6px] transition-all duration-200 shadow-md shadow-sky-500/10 active:scale-[0.99] mt-2 flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
            <span className="flex-shrink mx-4 text-xs text-[var(--text-muted)] font-medium">
              Or continue with
            </span>
            <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-indigo-500/40 hover:bg-indigo-500/5 active:border-indigo-500/40 focus:border-indigo-500/40 focus:outline-none text-[var(--text-primary)] font-medium text-xs py-2.5 px-4 rounded-[6px] flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0 fill-current text-[var(--text-primary)]" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Login with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('GitHub')}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-indigo-500/40 hover:bg-indigo-500/5 active:border-indigo-500/40 focus:border-indigo-500/40 focus:outline-none text-[var(--text-primary)] font-medium text-xs py-2.5 px-4 rounded-[6px] flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current shrink-0 text-[var(--text-primary)]" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Login with GitHub</span>
            </button>
          </div>

          <div className="mt-8 text-center space-y-4">
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
              By continuing, you agree to our{' '}
              <a href="#" className="underline font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="#" className="underline font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Terms of Use
              </a>
              .
            </p>

            <div className="pt-2 text-xs text-[var(--text-muted)] font-medium">
              Don't have an account?{' '}
              <NavLink to={window.location.search ? `/signup${window.location.search}` : "/signup"} className="text-[var(--text-primary)] font-bold underline ml-1">
                Sign Up
              </NavLink>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <AuthRightSection />
        </div>
      </div>
    </div>
  );
}

export default Login;