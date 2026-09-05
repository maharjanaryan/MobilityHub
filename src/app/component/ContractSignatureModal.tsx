// ContractSignatureModal.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileText, PenLine, User, CheckCircle, Loader2,
  AlertCircle, Shield, Clock, Eye, Download, FileSignature
} from 'lucide-react';

interface Contract {
  id: number;
  contractReference: string;
  bookingId: number;
  vehicleName: string;
  ownerName: string;
  renterName: string;
  ownerSigned: boolean;
  ownerSignedAt: string | null;
  renterSigned: boolean;
  renterSignedAt: string | null;
  contractStatus: string;
  contractText: string;
  ownerSignatureData: string | null;
  renterSignatureData: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContractSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  userRole: 'owner' | 'renter';
  onSign: (signatureData: string) => void;  // ✅ Pass signature data to parent
  loading?: boolean;
}

// Helper function to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  }
  return null;
};

export default function ContractSignatureModal({
  isOpen,
  onClose,
  contract,
  userRole,
  onSign,
  loading = false
}: ContractSignatureModalProps) {
  const [signatureData, setSignatureData] = useState<string>('');
  const [signatureError, setSignatureError] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const isOwner = userRole === 'owner';
  const hasSigned = isOwner ? contract?.ownerSigned : contract?.renterSigned;
  const isFullySigned = contract?.contractStatus === 'FULLY_SIGNED';

  // Initialize canvas
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctxRef.current = ctx;
        // Set background to white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  // Load existing signature if already signed
  useEffect(() => {
    if (isOpen && hasSigned && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const signatureData = isOwner ? contract?.ownerSignatureData : contract?.renterSignatureData;
        if (signatureData) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setIsSigned(true);
          };
          img.onerror = () => {
            console.error('Failed to load signature image');
          };
          img.src = signatureData;
        }
      }
    }
  }, [isOpen, hasSigned, contract, isOwner]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (hasSigned || isFullySigned) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || hasSigned || isFullySigned) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    ctxRef.current.closePath();

    // Save signature as base64 data URL
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
    setSignatureError('');
  };

  const clearSignature = () => {
    if (hasSigned || isFullySigned) return;
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    ctxRef.current.fillStyle = '#ffffff';
    ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current.strokeStyle = '#000000';
    ctxRef.current.lineWidth = 2;
    setSignatureData('');
    setSignatureError('');
  };

  // ✅ Updated handleSign to pass signature data to parent
  const handleSign = () => {
    if (!signatureData) {
      setSignatureError('Please sign the contract first');
      return;
    }
    if (hasSigned) {
      setSignatureError('You have already signed this contract');
      return;
    }
    // Pass the signature data to parent component
    onSign(signatureData);
  };

  // ─── PDF DOWNLOAD HANDLER ───
  const handleDownloadPdf = async () => {
    if (!contract) return;

    setDownloading(true);
    try {
      const token = getToken();
      if (!token) {
        alert('Please login to download the contract');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/contracts/${contract.bookingId}/download-pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to download contract');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contract_${contract.contractReference}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading contract:', error);
      alert('Failed to download contract. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen || !contract) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Vehicle Rental Contract
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {contract.contractReference}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Download PDF Button */}
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-blue-600 dark:text-blue-400 disabled:opacity-50"
                  title="Download PDF"
                >
                  {downloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Contract Status Banner */}
            <div className={`p-4 border-b ${isFullySigned ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
              hasSigned ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'}`}>
              <div className="flex items-center gap-3">
                {isFullySigned ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : hasSigned ? (
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                )}
                <div>
                  <p className={`font-semibold ${isFullySigned ? 'text-green-700 dark:text-green-400' :
                    hasSigned ? 'text-blue-700 dark:text-blue-400' :
                      'text-yellow-700 dark:text-yellow-400'}`}>
                    {isFullySigned ? '✅ Contract Fully Signed!' :
                      hasSigned ? `⏳ Waiting for ${isOwner ? 'Renter' : 'Owner'} to Sign` :
                        '📄 Awaiting Your Signature'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isFullySigned ? 'Both parties have signed the contract.' :
                      hasSigned ? `The ${isOwner ? 'renter' : 'owner'} has signed. Please sign to complete.` :
                        `Please sign the contract to ${isOwner ? 'approve' : 'confirm'} the booking.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Contract Details */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{contract.vehicleName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Booking ID</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">#{contract.bookingId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {contract.ownerName}
                    {contract.ownerSigned && (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Renter</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {contract.renterName}
                    {contract.renterSigned && (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {new Date(contract.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {contract.contractStatus.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Contract Text */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Contract Terms
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 max-h-60 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300 leading-relaxed">
                    {contract.contractText}
                  </pre>
                </div>
              </div>

              {/* Signature Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <PenLine className="w-4 h-4" />
                  {isOwner ? 'Owner Signature' : 'Renter Signature'}
                  {hasSigned && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-normal">
                      ✅ Signed on {new Date(isOwner ? contract.ownerSignedAt! : contract.renterSignedAt!).toLocaleString()}
                    </span>
                  )}
                </h4>

                {isFullySigned ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-400">Contract Fully Signed</p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Both parties have signed. You can now start the trip.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : !hasSigned ? (
                  <div>
                    <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-[200px] touch-none cursor-pen"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 dark:text-gray-600 text-sm">
                        {!signatureData && 'Sign here'}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={clearSignature}
                        className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
                      >
                        Clear Signature
                      </button>
                      <button
                        onClick={handleSign}
                        disabled={loading || !signatureData}
                        className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />}
                        {loading ? 'Signing...' : `Sign as ${isOwner ? 'Owner' : 'Renter'}`}
                      </button>
                    </div>

                    {signatureError && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">{signatureError}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-semibold text-blue-700 dark:text-blue-400">
                          Waiting for {isOwner ? 'Renter' : 'Owner'}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          You have already signed. Waiting for the other party to sign.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Digitally signed contract</span>
              </div>
              <div className="flex gap-3">
                {/* Download PDF Button in Footer */}
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download PDF
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition"
                >
                  {isFullySigned ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}