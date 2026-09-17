import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink, useLocation } from 'react-router';
import { loginUser, clearError } from "../authSlice";
import { useEffect, useState } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthRightSection from '../components/AuthRightSection';
import CodeItRocketLogo from '../components/CodeItRocketLogo';
import SocialLoginButtons from '../components/SocialLoginButtons';
import { getPostAuthRedirect } from '../utils/authRedirect';

const loginSchema = z.object({
  emailId: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

const inputClass = (hasError) =>
  `w-full bg-[var(--bg-secondary)] border ${
    hasError ? 'border-rose-500/60' : 'border-[var(--border-subtle)] focus:border-sky-500'
  } text-[var(--text-primary)] text-sm rounded-[6px] px-3.5 py-2.5 placeholder-[var(--text-muted)] focus:outline-none transition-colors duration-200`;

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getPostAuthRedirect(location.search), { replace: true });
      return;
    }
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('error');
    if (oauthError) {
      toast.error(oauthError, { id: 'oauth-error', duration: 6000 });
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [isAuthenticated, navigate, location.search, location.pathname]);

  const onSubmit = async (data) => {
    const resultAction = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(resultAction)) {
      toast.success(`Welcome back, ${resultAction.payload?.firstName || 'coder'}!`);
      navigate(getPostAuthRedirect(location.search), { replace: true });
    }
  };

  const redirectTarget = getPostAuthRedirect(location.search);

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4 py-8 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-5 flex flex-col justify-between py-2 px-0 sm:px-4 w-full max-w-md mx-auto lg:max-w-none">
          <div className="mb-6 sm:mb-8">
            <NavLink to="/" className="inline-flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-xl tracking-tight group">
              <CodeItRocketLogo className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight font-heading">CodeIt</span>
            </NavLink>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
              Login to your account
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
              Pick up where you left off.
            </p>
          </div>

          {error && (
            <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs rounded-[6px] mb-5 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{typeof error === 'string' ? error : (error?.message || 'Invalid Email or Password')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="mail@example.com"
                aria-invalid={!!errors.emailId}
                aria-describedby={errors.emailId ? "login-email-error" : undefined}
                className={inputClass(errors.emailId)}
                {...register('emailId')}
              />
              {errors.emailId && (
                <span id="login-email-error" className="text-rose-500 text-xs mt-1.5 block font-medium">
                  {errors.emailId.message}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "login-password-error" : undefined}
                  className={`${inputClass(errors.password)} pr-11`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.password && (
                <span id="login-password-error" className="text-rose-500 text-xs mt-1.5 block font-medium">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm py-2.5 rounded-[6px] transition-all duration-200 shadow-md shadow-sky-500/10 active:scale-[0.99] mt-2 flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="relative flex py-5 items-center" aria-hidden="true">
            <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
            <span className="flex-shrink mx-4 text-xs text-[var(--text-muted)] font-medium">
              Or continue with
            </span>
            <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
          </div>

          <SocialLoginButtons layout="stacked" redirectTo={redirectTarget} />

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
              <NavLink to={location.search ? `/signup${location.search}` : "/signup"} className="text-[var(--text-primary)] font-bold underline ml-1">
                Sign Up
              </NavLink>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 hidden lg:block">
          <AuthRightSection />
        </div>
      </div>
    </div>
  );
}

export default Login;
