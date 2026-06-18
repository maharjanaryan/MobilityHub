// app/components/PaymentModal.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  amount: number;
  onPaymentSuccess: () => void;
}

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  }
  return null;
};

export default function PaymentModal({
  isOpen,
  onClose,
  bookingId,
  amount,
  onPaymentSuccess,
}: PaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'ESEWA' | 'KHALTI' | null>(null);

  if (!isOpen) return null;

  const handlePayment = async (method: 'ESEWA' | 'KHALTI') => {
    setSelectedMethod(method);
    setLoading(true);
    setError(null);

    const token = getAuthToken();
    if (!token) {
      router.push('/signin');
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
          paymentMethod: method,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate payment');
      }

      const data = await response.json();

      if (method === 'KHALTI') {
        // Redirect to Khalti payment page
        if (data.paymentUrl) {
          window.open(data.paymentUrl, '_blank');
          // Poll for payment status or handle return URL
          pollKhaltiPaymentStatus(data.pidx);
        }
      } else if (method === 'ESEWA') {
        // Submit eSewa form
        const formData = JSON.parse(data.formData);
        submitEsewaForm(formData, data.paymentUrl);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initiation failed');
      setLoading(false);
    }
  };

  const pollKhaltiPaymentStatus = async (pidx: string) => {
    // Poll every 3 seconds for 2 minutes
    let attempts = 0;
    const maxAttempts = 40;

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
            onPaymentSuccess();
            onClose();
          }
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setLoading(false);
        setError('Payment verification timed out. Please check your payment status.');
      }
    }, 3000);
  };

  const submitEsewaForm = (formData: Record<string, string>, actionUrl: string) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;
    form.target = '_blank';

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Booking ID:</strong> #{bookingId}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Amount:</strong> Rs. {amount.toLocaleString()}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {/* Khalti Button */}
          <button
            onClick={() => handlePayment('KHALTI')}
            disabled={loading}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-colors flex items-center gap-3 disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800">Khalti Wallet</p>
              <p className="text-xs text-gray-500">Pay via Khalti wallet</p>
            </div>
            {loading && selectedMethod === 'KHALTI' && (
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            )}
          </button>

          {/* eSewa Button */}
          <button
            onClick={() => handlePayment('ESEWA')}
            disabled={loading}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-colors flex items-center gap-3 disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800">eSewa</p>
              <p className="text-xs text-gray-500">Pay via eSewa wallet</p>
            </div>
            {loading && selectedMethod === 'ESEWA' && (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            )}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            You will be redirected to the payment gateway to complete your transaction
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper icon component
const XCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);