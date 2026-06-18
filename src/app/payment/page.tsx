// app/payment-success/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import HomeHeader from '../home/HomeHeader';
import Footer from '../component/Footer';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get pidx from URL params (for Khalti)
    const pidx = searchParams.get('pidx');
    const transactionId = searchParams.get('transaction_id');

    // Verify payment on backend
    if (pidx) {
      verifyKhaltiPayment(pidx);
    } else if (transactionId) {
      // Handle eSewa success
      setLoading(false);
    }
  }, [searchParams]);

  const verifyKhaltiPayment = async (pidx: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/payments/khalti/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verified) {
          // Payment verified successfully
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <HomeHeader />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HomeHeader />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>
          <button
            onClick={() => router.push('/bookings')}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push('/home')}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Return to Home
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}