// app/payment-success/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, X } from 'lucide-react';
import HomeHeader from '../home/HomeHeader';
import Footer from '../component/Footer';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debug: Log all search params
    console.log('All search params:', Object.fromEntries(searchParams.entries()));

    const pidx = searchParams.get('pidx');
    const rawData = searchParams.get('data');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(errorParam);
      setLoading(false);
      return;
    }

    if (pidx) {
      console.log('Processing Khalti payment with pidx:', pidx);
      verifyKhaltiPayment(pidx);
    } else if (rawData) {
      console.log('Raw data from URL:', rawData);

      try {
        // First decode the URL-encoded data
        const decodedData = decodeURIComponent(rawData);
        console.log('URL decoded data:', decodedData);

        // Then decode base64
        const jsonString = atob(decodedData);
        console.log('JSON string:', jsonString);

        const parsedData = JSON.parse(jsonString);
        console.log('Parsed eSewa data:', parsedData);

        const { transaction_uuid, total_amount, status, transaction_code } = parsedData;

        if (status === 'COMPLETE') {
          localStorage.setItem('lastTransaction', JSON.stringify({
            transaction_uuid,
            total_amount,
            transaction_code
          }));
          verifyEsewaPayment(transaction_uuid, total_amount);
        } else {
          setError(`Payment status: ${status}`);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error decoding eSewa data:', error);
        // Try alternative decoding method
        try {
          // Sometimes the data is already base64 without URL encoding
          const jsonString = atob(rawData);
          const parsedData = JSON.parse(jsonString);
          console.log('Alternative parse successful:', parsedData);

          const { transaction_uuid, total_amount, status } = parsedData;
          if (status === 'COMPLETE') {
            verifyEsewaPayment(transaction_uuid, total_amount);
          } else {
            setError(`Payment status: ${status}`);
            setLoading(false);
          }
        } catch (error2) {
          console.error('Both decoding methods failed:', error2);
          setError('Invalid payment data format');
          setLoading(false);
        }
      }
    } else {
      console.error('No payment data received');
      setLoading(false);
      setError('No payment data received');
    }
  }, [searchParams]);

  const verifyKhaltiPayment = async (pidx: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Verifying Khalti payment...');

      const response = await fetch('http://localhost:8080/api/payments/khalti/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx }),
      });

      console.log('Khalti verification response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Khalti verification data:', data);
        if (data.verified) {
          setLoading(false);
        } else {
          setError('Payment verification failed');
          setLoading(false);
        }
      } else {
        setError('Payment verification failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error verifying Khalti payment:', error);
      setError('Error verifying payment');
      setLoading(false);
    }
  };

  const verifyEsewaPayment = async (transactionUuid: string, totalAmount: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Verifying eSewa payment...', { transactionUuid, totalAmount });

      // Check if token exists
      if (!token) {
        console.error('No access token found');
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/payments/esewa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_uuid: transactionUuid,
          total_amount: totalAmount
        }),
      });

      console.log('eSewa verification response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('eSewa verification data:', data);
        if (data.verified) {
          setLoading(false);
        } else {
          setError('Payment verification failed - not verified by server');
          setLoading(false);
        }
      } else {
        const errorText = await response.text();
        console.error('eSewa verification error:', errorText);
        setError(`Verification failed: ${response.status}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error verifying eSewa payment:', error);
      setError('Error connecting to server');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-950 to-gray-100 dark:to-gray-900 flex items-center justify-center py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          {error ? (
            <>
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10 text-red-600 dark:text-red-300" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Payment Failed</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => router.push('/home')}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Return to Home
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-300" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your booking has been confirmed. You will receive a confirmation email shortly.
              </p>
              <button
                onClick={() => router.push('/my-bookings')}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => router.push('/home')}
                className="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Return to Home
              </button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}