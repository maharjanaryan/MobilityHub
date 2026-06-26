// src/components/KycModal.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  kycStatus: "VERIFIED" | "APPROVED" | "PENDING" | "REJECTED" | "NOT_SUBMITTED" | null;
  userName?: string;
}

export default function KycModal({ isOpen, onClose, kycStatus, userName }: KycModalProps) {
  const router = useRouter();

  const getStatusConfig = () => {
    switch (kycStatus) {
      case "VERIFIED":
      case "APPROVED":
        return {
          icon: CheckCircle,
          color: "emerald",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          title: "KYC Verified ✅",
          message: "Your KYC is verified. You can now access all vehicle details and make bookings.",
          buttonText: "Continue",
          buttonAction: () => onClose(),
          showAction: false
        };
      case "PENDING":
        return {
          icon: Clock,
          color: "amber",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          title: "KYC Under Review ⏳",
          message: "Your KYC verification is currently being reviewed by our team. This usually takes 24-48 hours.",
          buttonText: "Check Status",
          buttonAction: () => router.push("/kyc-status"),
          showAction: true
        };
      case "REJECTED":
        return {
          icon: AlertTriangle,
          color: "red",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "KYC Rejected ❌",
          message: "Your KYC verification was rejected. Please review the feedback and resubmit your documents.",
          buttonText: "Resubmit KYC",
          buttonAction: () => router.push("/kyc/user"),
          showAction: true
        };
      default:
        return {
          icon: Shield,
          color: "blue",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          title: "KYC Required 🔒",
          message: "You need to complete KYC verification before you can view vehicle details or make bookings.",
          buttonText: "Complete KYC",
          buttonAction: () => router.push("/kyc/user"),
          showAction: true
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border ${config.borderColor}`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header */}
            <div className={`p-6 ${config.bgColor} border-b ${config.borderColor}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white shadow-sm`}>
                  <IconComponent className={`w-8 h-8 text-${config.color}-500`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{config.title}</h3>
                  {userName && (
                    <p className="text-sm text-gray-500">Welcome, {userName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-gray-600 leading-relaxed">{config.message}</p>

              {/* Additional info based on status */}
              {kycStatus === "PENDING" && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">What happens next?</p>
                      <ul className="text-sm text-amber-700 mt-1 space-y-1">
                        <li>• Our team reviews your documents</li>
                        <li>• You'll receive a notification once verified</li>
                        <li>• You can check status anytime</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {kycStatus === "REJECTED" && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Common reasons for rejection:</p>
                      <ul className="text-sm text-red-700 mt-1 space-y-1">
                        <li>• Blurry or unclear document photos</li>
                        <li>• Document expired or invalid</li>
                        <li>• Name mismatch with account</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {(!kycStatus || kycStatus === "NOT_SUBMITTED") && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Required Documents:</p>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Government-issued ID (Passport, Driver's License, Citizenship)</li>
                        <li>• Clear, readable photos of documents</li>
                        <li>• Selfie for verification</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              {config.showAction ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={config.buttonAction}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {config.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={config.buttonAction}
                  className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                >
                  {config.buttonText}
                </motion.button>
              )}

              {config.showAction && (
                <button
                  onClick={onClose}
                  className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Maybe later
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}