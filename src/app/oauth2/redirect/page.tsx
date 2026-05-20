// app/oauth2/redirect/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuth2Redirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const fullName = searchParams.get('fullName');
    const role = searchParams.get('role');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(errorParam);
      setTimeout(() => {
        router.push(`/signin?error=${encodeURIComponent(errorParam)}`);
      }, 2000);
      return;
    }

    if (accessToken) {
      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('user', JSON.stringify({
        id: userId,
        username: username || email?.split('@')[0],
        email: email,
        fullName: fullName,
        role: role || 'USER'
      }));

      // Redirect based on role
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/home');
      }
    } else if (!errorParam) {
      setError('No access token received from Google');
      setTimeout(() => {
        router.push('/signin?error=Google+login+failed');
      }, 2000);
    }
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Login Failed</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-400 mt-4">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google sign in...</p>
        <p className="text-sm text-gray-400 mt-2">Please wait while we redirect you</p>
      </div>
    </div>
  );
}