// app/components/payment/KhaltiPayment.tsx
"use client";

import { useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';

interface KhaltiPaymentProps {
  bookingId: number;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onClose: () => void;
}

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  }
  return null;
};

export default function KhaltiPayment({
  bookingId,
  amount,
  onSuccess,
  onError,
  onClose
}: KhaltiPaymentProps) {
  const [loading, setLoading] = useState(false);

  const initiateKhaltiPayment = async () => {
    setLoading(true);
    const token = getAuthToken();

    if (!token) {
      onError('Please login to continue');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: amount,
          paymentMethod: 'KHALTI',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate Khalti payment');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      if (data.paymentUrl) {
        // Open Khalti payment page in new tab
        window.open(data.paymentUrl, '_blank');
        // Start polling for payment status
        pollKhaltiPaymentStatus(data.pidx);
      } else {
        throw new Error('No payment URL received from Khalti');
      }

    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment initiation failed');
      setLoading(false);
    }
  };

  const pollKhaltiPaymentStatus = async (pidx: string) => {
    let attempts = 0;
    const maxAttempts = 40; // 2 minutes (40 * 3 seconds)

    const interval = setInterval(async () => {
      attempts++;
      try {
        const token = getAuthToken();
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
            clearInterval(interval);
            setLoading(false);
            onSuccess();
            onClose();
          }
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setLoading(false);
        onError('Payment verification timed out. Please check your payment status in your bookings.');
      }
    }, 3000);
  };

  return (
    <button
      onClick={initiateKhaltiPayment}
      disabled={loading}
      className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
        <Wallet className="w-6 h-6 text-purple-600" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-gray-800">Khalti Wallet</p>
        <p className="text-xs text-gray-500">Pay via Khalti wallet</p>
      </div>
      {loading && <Loader2 className="w-5 h-5 animate-spin text-purple-600" />}
    </button>
  );
}