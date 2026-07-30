import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { Eye, EyeOff, Code2, AlertCircle, Loader2 } from 'lucide-react';
import AuthRightSection from '../components/AuthRightSection';
import CodeItRocketLogo from '../components/CodeItRocketLogo';

const signupSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters'),
  emailId: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error: reduxError } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    const { confirmPassword, ...registerData } = data;
    dispatch(registerUser(registerData));
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} registration clicked! Connect backend OAuth integration to proceed.`);
  };

  const displayError = typeof reduxError === 'string' ? reduxError : reduxError?.message;

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-gray-200 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-indigo-500 selection:text-white">

      {/* Container wrapper */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* LEFT COLUMN: Auth Form */}
        <div className="lg:col-span-5 flex flex-col justify-between py-2 px-1 sm:px-4">

          {/* Logo Header */}
          <div className="mb-6">
            <NavLink to="/" className="inline-flex items-center gap-2.5 text-white font-extrabold text-2xl tracking-tight group">
              <CodeItRocketLogo className="w-10 h-10 group-hover:scale-105 transition-transform drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]" />
              <span className="text-2xl font-black tracking-tight">Code<span className="text-sky-400">It</span></span>
            </NavLink>
          </div>

          {/* Form Header */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create your account
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Join thousands of developers coding on CodeIt
            </p>
          </div>

          {/* Global Redux Error Banner */}
          {displayError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-5 flex items-center gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Main Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">

            {/* Full Name Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Username"
                className={`w-full bg-[#18181e] border ${errors.firstName ? 'border-red-500/80 focus:border-red-500' : 'border-[#292936] focus:border-indigo-500'
                  } text-white text-sm rounded-xl px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <span className="text-red-400 text-xs mt-1 block font-medium">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            {/* Email Address Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="mail@example.com"
                className={`w-full bg-[#18181e] border ${errors.emailId ? 'border-red-500/80 focus:border-red-500' : 'border-[#292936] focus:border-indigo-500'
                  } text-white text-sm rounded-xl px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200`}
                {...register('emailId')}
              />
              {errors.emailId && (
                <span className="text-red-400 text-xs mt-1 block font-medium">
                  {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full bg-[#18181e] border ${errors.password ? 'border-red-500/80 focus:border-red-500' : 'border-[#292936] focus:border-indigo-500'
                    } text-white text-sm rounded-xl px-4 py-2.5 pr-11 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors p-1"
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
                <span className="text-red-400 text-xs mt-1 block font-medium">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full bg-[#18181e] border ${errors.confirmPassword ? 'border-red-500/80 focus:border-red-500' : 'border-[#292936] focus:border-indigo-500'
                  } text-white text-sm rounded-xl px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <span className="text-red-400 text-xs mt-1 block font-medium">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.99] mt-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-[#22222e]"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium">
              Or continue with
            </span>
            <div className="flex-grow border-t border-[#22222e]"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google Signup */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="bg-[#16161c] border border-[#272735] hover:bg-[#1e1e26] hover:border-[#353548] text-white font-medium text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            {/* GitHub Signup */}
            <button
              type="button"
              onClick={() => handleSocialLogin('GitHub')}
              className="bg-[#16161c] border border-[#272735] hover:bg-[#1e1e26] hover:border-[#353548] text-white font-medium text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <svg className="w-4 h-4 fill-current shrink-0 text-white" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Footer Disclaimer */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-[11px] text-gray-400 leading-relaxed max-w-xs mx-auto">
              By registering, you agree to our{' '}
              <a href="#" className="underline font-semibold text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="#" className="underline font-semibold text-gray-300 hover:text-white transition-colors">
                Terms of Use
              </a>
              .
            </p>

            {/* Toggle to Login */}
            <div className="pt-1 text-xs text-gray-400 font-medium">
              Already have an account?{' '}
              <NavLink to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline ml-1">
                Login
              </NavLink>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Showcase Card */}
        <div className="lg:col-span-7">
          <AuthRightSection />
        </div>

      </div>
    </div>
  );
}

export default Signup;