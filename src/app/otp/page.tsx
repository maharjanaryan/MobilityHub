'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios'; // or use fetch

export default function OtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState<number>(60);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [isResending, setIsResending] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }

        // If no email in URL, try to get from localStorage
        if (!email) {
            const storedEmail = localStorage.getItem('verificationEmail');
            if (!storedEmail) {
                router.push('/signup');
            }
        } else {
            localStorage.setItem('verificationEmail', email);
        }
    }, [email, router]);

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
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(0, 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        setError('');
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setIsVerifying(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await axios.post('http://localhost:8080/api/auth/verify-email', {
                email: email || localStorage.getItem('verificationEmail'),
                verificationCode: otpValue
            });

            if (response.data.success) {
                setSuccessMessage('Email verified successfully! Redirecting to login...');
                localStorage.removeItem('verificationEmail');

                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    router.push('/signin');
                }, 2000);
            }
        } catch (err: any) {
            console.error('Verification error:', err);
            setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
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
                email: email || localStorage.getItem('verificationEmail')
            });

            if (response.data.success) {
                setSuccessMessage('New verification code sent to your email!');
                setCanResend(false);
                setTimeLeft(60);
                // Reset OTP inputs
                setOtp(['', '', '', '', '', '']);
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            }
        } catch (err: any) {
            console.error('Resend error:', err);
            setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const handleEditEmail = () => {
        router.push('/signup');
    };

    return (
        <main className="min-h-screen bg-green-200">
            <div className="flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-8">
                        <div className="flex justify-center mb-6">
                            <img src="/logo.png" alt="Logo" className="rounded-full w-10 h-10 object-cover" />
                        </div>

                        <div className="text-center mb-6">
                            <h1 className="text-xl font-semibold text-gray-800 mb-2">Verify your email</h1>
                            <p className="text-sm text-gray-500">
                                We've sent a 6-digit verification code to
                                <br />
                                <span className="font-medium text-gray-700">
                                    {email || localStorage.getItem('verificationEmail')}
                                </span>
                            </p>
                            <button
                                onClick={handleEditEmail}
                                className="text-xs text-green-600 hover:text-green-700 mt-1 hover:underline"
                            >
                                Edit email address
                            </button>
                        </div>

                        {successMessage && (
                            <div className="mb-4 text-center text-sm text-green-600 bg-green-50 rounded-lg py-2">
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 text-center text-sm text-red-500 bg-red-50 rounded-lg py-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
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
                                        disabled={isVerifying}
                                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleVerify}
                                disabled={isVerifying}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isVerifying ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Verifying...
                                    </div>
                                ) : (
                                    'Verify & Continue'
                                )}
                            </button>

                            <div className="text-center">
                                {!canResend ? (
                                    <p className="text-xs text-gray-400">
                                        Resend code in <span className="font-medium text-gray-600">{timeLeft}s</span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResendCode}
                                        disabled={isResending}
                                        className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isResending ? 'Sending...' : 'Resend verification code'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <Link
                                href="/signin"
                                className="block text-center text-sm text-gray-500 hover:text-gray-700"
                            >
                                ← Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}