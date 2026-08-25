// app/components/payment/PaymentModal.tsx
"use client";

import React, { useState } from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';
import KhaltiPayment from './KhaltiPayment';
import EsewaPayment from './EsewaPayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  amount: number;
  serviceFee?: number;
  insuranceFee?: number;
  onPaymentSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  bookingId,
  amount,
  serviceFee = 0,
  insuranceFee = 0,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [error, setError] = useState<string | null>(null);

  const safeAmount = amount || 0;
  const safeServiceFee = serviceFee || 0;
  const safeInsuranceFee = insuranceFee || 0;
  const rentalAmount = safeAmount - safeServiceFee - safeInsuranceFee;

  if (!isOpen) return null;

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Select Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Booking ID:</strong> #{bookingId}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Total Amount:</strong> Rs. {safeAmount.toLocaleString()}
          </p>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Rental Amount</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Rs. {rentalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Insurance Fee</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Rs. {safeInsuranceFee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Service Fee</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Rs. {safeServiceFee.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <KhaltiPayment
            bookingId={bookingId}
            amount={safeAmount}
            serviceFee={safeServiceFee}
            insuranceFee={safeInsuranceFee}
            onSuccess={() => {
              clearError();
              onPaymentSuccess();
            }}
            onError={handleError}
            onClose={onClose}
          />

          <EsewaPayment
            bookingId={bookingId}
            amount={safeAmount}
            serviceFee={safeServiceFee}
            insuranceFee={safeInsuranceFee}
            onSuccess={() => {
              clearError();
              onPaymentSuccess();
            }}
            onError={handleError}
            onClose={onClose}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            You will be redirected to the payment gateway to complete your transaction
          </p>
        </div>
      </div>
    </div>
  );
}