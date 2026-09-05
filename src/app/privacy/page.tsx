
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, Cookie, Mail, User, Smartphone, AlertCircle, CheckCircle } from "lucide-react";
import Header from "../component/Header";
import Footer from "../component/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          {/* Header */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-8">

            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                1. Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                At MobilityHub, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our platform. Please read this policy carefully
                to understand our practices regarding your personal data.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Personal Information
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                    <li>Full name and contact information (email, phone number)</li>
                    <li>Government-issued ID and driver's license information</li>
                    <li>Profile photo and bio information</li>
                    <li>Payment and billing information</li>
                    <li>KYC verification documents</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Usage Information
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                    <li>Browser type and version</li>
                    <li>IP address and device information</li>
                    <li>Pages visited and time spent on our platform</li>
                    <li>Search queries and booking history</li>
                    <li>Location data (with your consent)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
                    <Cookie className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Cookies & Tracking
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                    <li>Session cookies for authentication</li>
                    <li>Analytics cookies for platform improvement</li>
                    <li>Preference cookies for user experience</li>
                    <li>Third-party cookies for payment processing</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                3. How We Use Your Information
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>To create and manage user accounts</li>
                <li>To process and confirm vehicle bookings</li>
                <li>To facilitate payments and security deposits</li>
                <li>To verify user identity and prevent fraud</li>
                <li>To improve our platform and user experience</li>
                <li>To send booking confirmations and notifications</li>
                <li>To send marketing communications (with consent)</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                4. Data Sharing & Disclosure
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li><strong>Vehicle Owners:</strong> Your information is shared with vehicle owners for booking purposes.</li>
                <li><strong>Renters:</strong> Your vehicle details and location are shared with renters.</li>
                <li><strong>Payment Partners:</strong> Payment information is shared with our payment processors.</li>
                <li><strong>Legal Compliance:</strong> We may share information when required by law.</li>
                <li><strong>Service Providers:</strong> We share data with trusted service providers who assist us.</li>
              </ul>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                5. Data Security
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>All data is encrypted using industry-standard protocols.</li>
                <li>We use secure servers with firewall protection.</li>
                <li>Access to personal data is restricted to authorized personnel.</li>
                <li>We regularly audit our security practices.</li>
                <li>Payment data is handled by PCI-DSS compliant partners.</li>
                <li>We implement two-factor authentication for sensitive actions.</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                6. Data Retention
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>We retain your data as long as your account is active.</li>
                <li>Data is retained to fulfill legal and regulatory obligations.</li>
                <li>You may request data deletion at any time.</li>
                <li>Booking records are retained for 7 years for tax purposes.</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                7. Your Rights
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li><strong>Access:</strong> You can request a copy of your data.</li>
                <li><strong>Correction:</strong> You can update or correct your information.</li>
                <li><strong>Deletion:</strong> You can request deletion of your account.</li>
                <li><strong>Opt-out:</strong> You can opt out of marketing communications.</li>
                <li><strong>Data Portability:</strong> You can request your data in a machine-readable format.</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <Cookie className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                8. Cookies Policy
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li><strong>Essential Cookies:</strong> Required for platform functionality.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand user behavior.</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li>
                <li><strong>Authentication Cookies:</strong> Keep you logged in securely.</li>
                <li><strong>Third-party Cookies:</strong> Used by our payment and analytics partners.</li>
              </ul>
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can manage cookie preferences in your browser settings. Disabling cookies may affect platform functionality.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                9. Children's Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                MobilityHub is not intended for children under 18 years of age. We do not knowingly collect
                personal information from children. If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us immediately.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                10. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by
                posting the new policy on this page. We encourage you to review this policy periodically
                for any updates.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                11. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or your
                personal data, please contact our Data Protection Officer:
              </p>
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">📧 privacy@mobilityhub.com</p>
                <p className="text-gray-700 dark:text-gray-300">📞 +977-1-XXXXXXX</p>
                <p className="text-gray-700 dark:text-gray-300">📍 Kathmandu, Nepal</p>
              </div>
            </section>

          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
            <p>We are committed to protecting your privacy and personal data.</p>
            <p className="mt-1">© {new Date().getFullYear()} MobilityHub. All rights reserved.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}