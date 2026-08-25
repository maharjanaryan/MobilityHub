// app/components/payment/EsewaPayment.tsx
"use client";

import { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';

interface EsewaPaymentProps {
  bookingId: number;
  amount: number;
  serviceFee: number;
  insuranceFee: number;
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

export default function EsewaPayment({
  bookingId,
  amount,
  serviceFee,
  insuranceFee,
  onSuccess,
  onError,
  onClose
}: EsewaPaymentProps) {
  const [loading, setLoading] = useState(false);

  const initiateEsewaPayment = async () => {
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
          serviceFee: serviceFee,
          insuranceFee: insuranceFee,
          paymentMethod: 'ESEWA',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate eSewa payment');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      if (data.formData) {
        const formData = JSON.parse(data.formData);
        submitEsewaForm(formData, data.paymentUrl);
      } else {
        throw new Error('No form data received from eSewa');
      }

    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment initiation failed');
      setLoading(false);
    }
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
  };

  return (
    <button
      onClick={initiateEsewaPayment}
      disabled={loading}
      className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <CreditCard className="w-6 h-6 text-blue-600" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-gray-800">eSewa</p>
        <p className="text-xs text-gray-500">Pay via eSewa wallet</p>
      </div>
      {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
    </button>
  );
}