// app/component/KycModal.tsx
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
  FileText,
  User,
  IdCard
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

  // If KYC is verified, don't show the modal
  if (kycStatus === "VERIFIED" || kycStatus === "APPROVED") {
    return null;
  }

  const getStatusConfig = () => {
    switch (kycStatus) {
      case "PENDING":
        return {
          icon: Clock,
          color: "amber",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          title: "KYC Under Review ⏳",
          message: `Hi ${userName || "there"}, your KYC verification is currently being reviewed by our team. This usually takes 24-48 hours. You'll be notified once it's complete.`,
          buttonText: "Check Status",
          buttonAction: () => router.push("/kyc/status"),
          showAction: true,
          showMaybeLater: true,
          details: [
            "• Our team is reviewing your documents",
            "• You'll receive a notification once verified",
            "• You can check status anytime"
          ]
        };
      case "REJECTED":
        return {
          icon: AlertTriangle,
          color: "red",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "KYC Rejected ❌",
          message: `Hi ${userName || "there"}, your KYC verification was rejected. Please review the feedback and resubmit your documents with correct information.`,
          buttonText: "Resubmit KYC",
          buttonAction: () => router.push("/kyc/owner"),
          showAction: true,
          showMaybeLater: true,
          details: [
            "• Blurry or unclear document photos",
            "• Document expired or invalid",
            "• Name mismatch with account"
          ]
        };
      default:
        return {
          icon: Shield,
          color: "blue",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          title: "KYC Required 🔒",
          message: `Hi ${userName || "there"}, you need to complete KYC verification before you can view vehicle details or make bookings. This is a one-time process to ensure safety and security.`,
          buttonText: "Complete KYC",
          buttonAction: () => router.push("/kyc/owner"),
          showAction: true,
          showMaybeLater: true,
          details: [
            "• Government-issued ID (Passport, Driver's License, Citizenship)",
            "• Clear, readable photos of documents",
            "• Selfie for verification"
          ]
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - clicking on backdrop won't close the modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border ${config.borderColor}`}
          >
            {/* Close button - only closes modal, doesn't grant access */}
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
              <div className={`rounded-xl p-4 border ${config.bgColor} ${config.borderColor}`}>
                <div className="flex items-start gap-3">
                  <FileText className={`w-5 h-5 text-${config.color}-500 mt-0.5 flex-shrink-0`} />
                  <div>
                    <p className={`text-sm font-medium text-${config.color}-800`}>
                      {kycStatus === "PENDING" ? "What happens next?" :
                        kycStatus === "REJECTED" ? "Common reasons for rejection:" :
                          "Required Documents:"}
                    </p>
                    <ul className={`text-sm text-${config.color}-700 mt-1 space-y-1`}>
                      {config.details?.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              {config.showAction && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={config.buttonAction}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {config.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  {/* "Maybe later" - ONLY closes the modal, does NOT grant access */}
                  {config.showMaybeLater && (
                    <button
                      onClick={onClose}
                      className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Maybe later
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}