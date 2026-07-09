// app/components/payment/PaymentModal.tsx
"use client";

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import KhaltiPayment from './KhaltiPayment';
import EsewaPayment from './EsewaPayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  amount: number;
  onPaymentSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  bookingId,
  amount,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
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
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {/* Khalti Payment Component */}
          <KhaltiPayment
            bookingId={bookingId}
            amount={amount}
            onSuccess={() => {
              clearError();
              onPaymentSuccess();
            }}
            onError={handleError}
            onClose={onClose}
          />

          {/* eSewa Payment Component */}
          <EsewaPayment
            bookingId={bookingId}
            amount={amount}
            onSuccess={() => {
              clearError();
              onPaymentSuccess();
            }}
            onError={handleError}
            onClose={onClose}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            You will be redirected to the payment gateway to complete your transaction
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Your booking will be confirmed after successful payment
          </p>
        </div>
      </div>
    </div>
  );
}