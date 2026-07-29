import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';

const signupSchema = z.object({
  firstName: z.string().min(3, 'Name must be at least 3 characters'),
  emailId: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Password strength calculator
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = [
    { label: 'Very Weak', color: 'bg-error' },
    { label: 'Weak', color: 'bg-warning' },
    { label: 'Fair', color: 'bg-warning' },
    { label: 'Good', color: 'bg-success' },
    { label: 'Strong', color: 'bg-success' },
    { label: 'Very Strong', color: 'bg-info' },
  ];
  return { score, ...levels[Math.min(score, 5)] };
}

function PasswordStrengthBar({ password }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-base-300'}`}
          />
        ))}
      </div>
      <p className="text-xs font-semibold text-base-content/60">{label}</p>
    </div>
  );
}

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  // Watch password for strength meter
  const watchedPassword = watch('password', '');
  useEffect(() => { setPasswordValue(watchedPassword); }, [watchedPassword]);
  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated, navigate]);

  const onSubmit = (data) => dispatch(registerUser(data));

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          {/* Logo */}
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-content text-sm font-black">
                {'{ }'}
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-primary">CodeIt</h1>
            <p className="text-base-content/60 text-sm mt-1">Join thousands of competitive coders</p>
          </div>

          <div className="divider m-0" />

          {/* Error banner */}
          {error && (
            <div className="alert alert-error text-sm">
              <span>⚠️ {typeof error === 'string' ? error : 'Something went wrong.'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* First Name */}
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text font-semibold">Full Name</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className={`input input-bordered w-full ${errors.firstName ? 'input-error' : ''}`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.firstName.message}</span>
                </label>
              )}
            </div>

            {/* Email */}
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`input input-bordered w-full ${errors.emailId ? 'input-error' : ''}`}
                {...register('emailId')}
              />
              {errors.emailId && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.emailId.message}</span>
                </label>
              )}
            </div>

            {/* Password */}
            <div className="form-control mb-5">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className={`input input-bordered w-full pr-12 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password ? (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              ) : (
                <PasswordStrengthBar password={passwordValue} />
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm" />
                  Creating account…
                </span>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>

          <div className="divider m-0" />

          {/* Login link */}
          <p className="text-center text-base-content/60 text-sm">
            Already have an account?{' '}
            <NavLink to="/login" className="link link-primary font-semibold">
              Sign In →
            </NavLink>
          </p>

          <p className="text-center text-base-content/40 text-xs mt-2">
            By signing up, you agree to our Terms of Service &amp; Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;