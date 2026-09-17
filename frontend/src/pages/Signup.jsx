import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink, useLocation } from 'react-router';
import { registerUser, clearError } from '../authSlice';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthRightSection from '../components/AuthRightSection';
import CodeItRocketLogo from '../components/CodeItRocketLogo';
import SocialLoginButtons from '../components/SocialLoginButtons';
import { getPostAuthRedirect } from '../utils/authRedirect';

const signupSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50, 'First name is too long'),
  lastName: z.string().trim().max(50, 'Last name is too long').optional().or(z.literal('')),
  emailId: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password is too long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const inputClass = (hasError) =>
  `w-full bg-[var(--bg-secondary)] border ${
    hasError ? 'border-rose-500/60' : 'border-[var(--border-subtle)] focus:border-sky-500'
  } text-[var(--text-primary)] text-sm rounded-[6px] px-3.5 py-2.5 placeholder-[var(--text-muted)] focus:outline-none transition-colors duration-200`;

const FieldError = ({ id, message }) =>
  message ? (
    <span id={id} className="text-rose-500 text-xs mt-1 block font-medium">
      {message}
    </span>
  ) : null;

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error: reduxError } = useSelector((state) => state.auth);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const passwordValue = watch('password') || '';

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
    const { confirmPassword, lastName, ...registerData } = data;
    if (lastName && lastName.trim()) registerData.lastName = lastName.trim();
    const resultAction = await dispatch(registerUser(registerData));
    if (registerUser.fulfilled.match(resultAction)) {
      toast.success('Account created. Happy coding!');
      navigate(getPostAuthRedirect(location.search), { replace: true });
    }
  };

  const displayError = typeof reduxError === 'string' ? reduxError : reduxError?.message;
  const redirectTarget = getPostAuthRedirect(location.search);

  // simple strength meter: length + character variety
  const strength = (() => {
    if (!passwordValue) return 0;
    let score = 0;
    if (passwordValue.length >= 8) score++;
    if (passwordValue.length >= 12) score++;
    if (/[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue)) score++;
    if (/\d/.test(passwordValue) || /[^A-Za-z0-9]/.test(passwordValue)) score++;
    return score;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500'][strength];

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4 py-8 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-5 flex flex-col justify-between py-2 px-0 sm:px-4 w-full max-w-md mx-auto lg:max-w-none">
          <div className="mb-6">
            <NavLink to="/" className="inline-flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-xl tracking-tight group">
              <CodeItRocketLogo className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight font-heading">CodeIt</span>
            </NavLink>
          </div>

          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
              Create your account
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
              Practice DSA. Build Skills. Crack Placements.
            </p>
          </div>

          {displayError && (
            <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs rounded-[6px] mb-5 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-first" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  First name
                </label>
                <input
                  id="signup-first"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Ada"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "signup-first-error" : undefined}
                  className={inputClass(errors.firstName)}
                  {...register('firstName')}
                />
                <FieldError id="signup-first-error" message={errors.firstName?.message} />
              </div>
              <div>
                <label htmlFor="signup-last" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Last name <span className="font-normal text-[var(--text-muted)]">(optional)</span>
                </label>
                <input
                  id="signup-last"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Lovelace"
                  aria-invalid={!!errors.lastName}
                  className={inputClass(errors.lastName)}
                  {...register('lastName')}
                />
                <FieldError id="signup-last-error" message={errors.lastName?.message} />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="mail@example.com"
                aria-invalid={!!errors.emailId}
                aria-describedby={errors.emailId ? "signup-email-error" : undefined}
                className={inputClass(errors.emailId)}
                {...register('emailId')}
              />
              <FieldError id="signup-email-error" message={errors.emailId?.message} />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "signup-password-error" : "signup-password-strength"}
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
              {passwordValue && (
                <div id="signup-password-strength" className="mt-1.5 flex items-center gap-2" aria-live="polite">
                  <div className="flex-1 h-1 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                    <div className={`h-full ${strengthColor} transition-all`} style={{ width: `${(strength / 4) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium w-12 text-right">{strengthLabel}</span>
                </div>
              )}
              <FieldError id="signup-password-error" message={errors.password?.message} />
            </div>

            <div>
              <label htmlFor="signup-confirm" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "signup-confirm-error" : undefined}
                className={inputClass(errors.confirmPassword)}
                {...register('confirmPassword')}
              />
              <FieldError id="signup-confirm-error" message={errors.confirmPassword?.message} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm py-2.5 rounded-[6px] transition-all duration-200 shadow-md shadow-sky-500/10 active:scale-[0.99] mt-3 flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="relative flex py-4 items-center" aria-hidden="true">
            <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
            <span className="flex-shrink mx-4 text-xs text-[var(--text-muted)] font-medium">
              Or continue with
            </span>
            <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
          </div>

          <SocialLoginButtons layout="grid" redirectTo={redirectTarget} />

          <div className="mt-6 text-center space-y-3">
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
              By registering, you agree to our{' '}
              <a href="#" className="underline font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="#" className="underline font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Terms of Use
              </a>
              .
            </p>

            <div className="pt-1 text-xs text-[var(--text-muted)] font-medium">
              Already have an account?{' '}
              <NavLink to={location.search ? `/login${location.search}` : "/login"} className="text-[var(--text-primary)] font-bold underline ml-1">
                Login
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

export default Signup;
