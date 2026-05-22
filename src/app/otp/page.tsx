'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function OtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromUrl = searchParams.get('email') || '';

    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState<number>(60);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [isResending, setIsResending] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Initialize email from URL or localStorage
    useEffect(() => {
        if (emailFromUrl) {
            setEmail(emailFromUrl);
            localStorage.setItem('verificationEmail', emailFromUrl);
        } else {
            const storedEmail = localStorage.getItem('verificationEmail');
            if (storedEmail) {
                setEmail(storedEmail);
            } else {
                // No email found, redirect to signup
                router.push('/signup');
            }
        }

        // Focus first input
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [emailFromUrl, router]);

    // Timer for resend code
    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(0, 1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Move to previous input on backspace if current is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        const pastedDigits = pastedData.slice(0, 6).split('').filter(char => /^\d+$/.test(char));

        if (pastedDigits.length > 0) {
            const newOtp = [...otp];
            for (let i = 0; i < Math.min(pastedDigits.length, 6); i++) {
                newOtp[i] = pastedDigits[i];
            }
            setOtp(newOtp);

            // Focus the next empty input or last filled
            const lastFilledIndex = Math.min(pastedDigits.length - 1, 5);
            if (lastFilledIndex < 5 && pastedDigits.length < 6) {
                inputRefs.current[lastFilledIndex + 1]?.focus();
            } else if (lastFilledIndex === 5) {
                inputRefs.current[5]?.focus();
            }
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');

        if (otpValue.length !== 6) {
            setError('Please enter the complete 6-digit verification code');
            return;
        }

        setIsVerifying(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await axios.post('http://localhost:8080/api/auth/verify-email', {
                email: email,
                verificationCode: otpValue
            });

            if (response.data.success || response.status === 200) {
                setSuccessMessage('Email verified successfully! Redirecting to sign in page...');

                // Clear verification email from localStorage
                localStorage.removeItem('verificationEmail');

                // Store verification status (optional)
                localStorage.setItem('emailVerified', 'true');

                // Redirect to sign in page after 2 seconds
                setTimeout(() => {
                    router.push('/signin?verified=true&email=' + encodeURIComponent(email));
                }, 2000);
            } else {
                throw new Error(response.data.message || 'Verification failed');
            }
        } catch (err: any) {
            console.error('Verification error:', err);

            // Handle specific error cases
            if (err.response?.status === 400) {
                setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
            } else if (err.response?.status === 404) {
                setError('User not found. Please sign up again.');
                setTimeout(() => {
                    router.push('/signup');
                }, 2000);
            } else if (err.response?.status === 410) {
                setError('Verification code has expired. Please request a new one.');
                setCanResend(true);
            } else {
                setError(err.response?.data?.message || 'Failed to verify email. Please try again.');
            }

            // Reset OTP on failure
            setOtp(['', '', '', '', '', '']);
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;

        setIsResending(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await axios.post('http://localhost:8080/api/auth/resend-verification', {
                email: email
            });

            if (response.data.success || response.status === 200) {
                setSuccessMessage('New verification code sent to your email!');
                setCanResend(false);
                setTimeLeft(60);

                // Reset OTP inputs
                setOtp(['', '', '', '', '', '']);

                // Focus first input
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            } else {
                throw new Error(response.data.message || 'Failed to resend code');
            }
        } catch (err: any) {
            console.error('Resend error:', err);

            if (err.response?.status === 429) {
                setError('Too many requests. Please wait a moment before trying again.');
            } else if (err.response?.status === 404) {
                setError('User not found. Please sign up again.');
                setTimeout(() => {
                    router.push('/signup');
                }, 2000);
            } else {
                setError(err.response?.data?.message || 'Failed to resend verification code. Please try again.');
            }
        } finally {
            setIsResending(false);
        }
    };

    const handleEditEmail = () => {
        // Clear stored email and navigate back to signup
        localStorage.removeItem('verificationEmail');
        router.push('/signup');
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
                        <div className="flex justify-center mb-6">
                            <div className="bg-green-100 rounded-full p-3">
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

                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
                            <p className="text-sm text-gray-500">
                                We've sent a 6-digit verification code to
                            </p>
                            <p className="text-sm font-medium text-gray-700 mt-1">
                                {email}
                            </p>
                            <button
                                onClick={handleEditEmail}
                                className="text-xs text-green-600 hover:text-green-700 mt-2 hover:underline transition"
                                disabled={isVerifying || isResending}
                            >
                                Edit email address
                            </button>
                        </div>

                        {/* Success Message */}
                        {successMessage && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {successMessage}
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* OTP Input Fields */}
                            <div className="flex justify-center gap-2 sm:gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        disabled={isVerifying || isResending}
                                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                                        autoComplete="off"
                                    />
                                ))}
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={handleVerify}
                                disabled={isVerifying || isResending}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isVerifying ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    'Verify & Continue'
                                )}
                            </button>

                            {/* Resend Code Section */}
                            <div className="text-center">
                                {!canResend ? (
                                    <p className="text-xs text-gray-400">
                                        Resend code in <span className="font-medium text-gray-600">{timeLeft}</span> seconds
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResendCode}
                                        disabled={isResending}
                                        className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {isResending ? (
                                            <span className="flex items-center justify-center gap-1">
                                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending...
                                            </span>
                                        ) : (
                                            'Resend verification code'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Back to Sign In Link */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <Link
                                href="/signin"
                                className="block text-center text-sm text-gray-500 hover:text-gray-700 transition"
                            >
                                ← Back to sign in
                            </Link>
                        </div>

                        {/* Help Text */}
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Didn't receive the code? Check your spam folder or contact support.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}