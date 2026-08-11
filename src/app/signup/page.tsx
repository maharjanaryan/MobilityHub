'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const validateForm = (): boolean => {
    // Validate first name
    if (!firstName.trim()) {
      setError('First name is required');
      return false;
    }

    // Validate last name
    if (!lastName.trim()) {
      setError('Last name is required');
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Validate password
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Validate terms agreement
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const username = email.split('@')[0]; // Create username from email prefix

      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email.trim().toLowerCase(),
          fullName: fullName,
          password: password,
          phoneNumber: phoneNumber.trim(), // Include phone number if backend supports it
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create account');
      }

      console.log('Sign up successful:', data);

      // Store email for OTP verification
      localStorage.setItem('verificationEmail', email.trim().toLowerCase());

      // Redirect to OTP verification page with email parameter
      router.push(`/otp`);

    } catch (err: any) {
      console.error('Sign up error:', err);

      // Handle specific error cases
      if (err.message.includes('email already exists') || err.message.includes('duplicate')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.message.includes('username already exists')) {
        setError('Username already taken. Please try a different email address.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setIsLoading(true);
    // Redirect to backend OAuth2 authorization endpoint for Google
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/signin.png')" }}
    >
      {/* Overlay for better text readability */}
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-black/30">
        <div className="w-full max-w-md">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-5 sm:p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="rounded-full w-10 h-10 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40x40?text=Logo';
                  }}
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">Create Account</h1>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">Join us today and get started</p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 dark:text-red-300 text-sm rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
                {error.includes('already exists') && (
                  <div className="mt-2">
                    <Link href="/signin" className="text-green-600 hover:underline font-medium">
                      Click here to sign in →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFirstName(e.target.value);
                      setError('');
                    }}
                    placeholder="First Name"
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setLastName(e.target.value);
                      setError('');
                    }}
                    placeholder="Last Name"
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter Your Email Address"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPhoneNumber(e.target.value);
                    setError('');
                  }}
                  placeholder="Phone Number"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                  disabled={isLoading}
                />
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                  disabled={isLoading}
                />
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Must be at least 8 characters with 1 uppercase letter and 1 number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Confirm Password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setAgreeTerms(e.target.checked);
                      setError('');
                    }}
                    className="rounded text-green-600 focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    I agree to the{' '}
                    <Link href="/terms" className="text-green-600 dark:text-green-300 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-green-600 dark:text-green-300 hover:underline">Privacy Policy</Link>
                    <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Sign up'
                )}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800" />
              <span className="mx-3 text-xs text-gray-400 dark:text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800" />
            </div>

            <button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isLoading ? 'Redirecting...' : 'Sign up with Google'}
            </button>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
              Already have an account?{' '}
              <Link href="/signin" className="text-green-600 dark:text-green-300 font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}