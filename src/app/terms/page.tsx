// app/terms/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, FileText, CheckCircle, AlertCircle } from "lucide-react";
import Header from "../component/Header";
import Footer from "../component/Footer";

export default function TermsPage() {
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Terms & Conditions</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-8">

            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                1. Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Welcome to MobilityHub. These Terms & Conditions govern your use of our vehicle rental platform.
                By using our services, you agree to comply with and be bound by these terms. Please read them carefully
                before using our platform.
              </p>
            </section>

            {/* Definitions */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                2. Definitions
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong className="text-gray-800 dark:text-gray-200">Platform:</strong> MobilityHub website and mobile application.</li>
                <li><strong className="text-gray-800 dark:text-gray-200">User:</strong> Any person who accesses or uses the platform.</li>
                <li><strong className="text-gray-800 dark:text-gray-200">Renter:</strong> A user who books a vehicle through the platform.</li>
                <li><strong className="text-gray-800 dark:text-gray-200">Owner:</strong> A user who lists a vehicle for rent on the platform.</li>
                <li><strong className="text-gray-800 dark:text-gray-200">Vehicle:</strong> Any motor vehicle listed for rent on the platform.</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                3. User Accounts
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>You must create an account to use our services.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must provide accurate and complete information during registration.</li>
                <li>You are solely responsible for all activities that occur under your account.</li>
                <li>You must be at least 18 years old to use our platform.</li>
                <li>You agree to notify us immediately of any unauthorized use of your account.</li>
              </ul>
            </section>

            {/* Vehicle Listings */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                4. Vehicle Listings
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>Owners must provide accurate and truthful information about their vehicles.</li>
                <li>Vehicle listings must include clear photos and accurate specifications.</li>
                <li>All vehicles must be in good working condition and legally roadworthy.</li>
                <li>Owners must maintain valid insurance coverage for their vehicles.</li>
                <li>Owners must complete KYC verification before listing vehicles.</li>
              </ul>
            </section>

            {/* Booking Process */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                5. Booking Process
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>Bookings are confirmed only after successful payment.</li>
                <li>Renters must provide valid driver's license information.</li>
                <li>Booking requests are subject to approval by the vehicle owner.</li>
                <li>Once confirmed, bookings are legally binding.</li>
                <li>Renters must pick up the vehicle at the agreed time and location.</li>
                <li>Late returns may result in additional charges.</li>
              </ul>
            </section>

            {/* Payments */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                6. Payments & Fees
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>All payments are processed securely through our payment partners.</li>
                <li>Prices are displayed in Nepalese Rupees (NPR).</li>
                <li>A service fee of up to 8% is charged on each booking.</li>
                <li>Electric vehicles enjoy a reduced service fee of 4%.</li>
                <li>Security deposits are held and refunded after trip completion.</li>
                <li>Refunds are processed within 5-7 business days.</li>
              </ul>
            </section>

            {/* Cancellation Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                7. Cancellation Policy
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>Renters can cancel bookings before the pickup date.</li>
                <li>Cancellation fees may apply depending on the timing.</li>
                <li>Owners can reject booking requests before confirmation.</li>
                <li>Once a booking is confirmed, cancellations are subject to penalties.</li>
                <li>Refunds are issued to the original payment method.</li>
              </ul>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                8. User Responsibilities
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>Users must comply with all applicable laws and regulations.</li>
                <li>Renters must return vehicles in the same condition as received.</li>
                <li>Renters are responsible for any damage to the vehicle.</li>
                <li>Renters must not use vehicles for illegal activities.</li>
                <li>Renters must not sublease vehicles to third parties.</li>
                <li>Owners must maintain their vehicles in good condition.</li>
                <li>Users must keep their contact information up to date.</li>
              </ul>
            </section>

            {/* Insurance */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                9. Insurance
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>Standard insurance coverage is included in the booking.</li>
                <li>Premium insurance is available at an additional cost.</li>
                <li>Insurance claims are subject to terms and conditions of the insurance provider.</li>
                <li>Renters are responsible for any deductible amounts.</li>
                <li>Damage not covered by insurance is the renter's responsibility.</li>
              </ul>
            </section>

            {/* Liability */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                10. Limitation of Liability
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>MobilityHub acts as an intermediary between renters and owners.</li>
                <li>We are not responsible for the condition of listed vehicles.</li>
                <li>We are not liable for any accidents or damages during rentals.</li>
                <li>We do not guarantee the availability or accuracy of listings.</li>
                <li>Users assume all risks associated with using our platform.</li>
                <li>Our liability is limited to the maximum extent permitted by law.</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                11. Governing Law
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                These Terms & Conditions are governed by the laws of Nepal. Any disputes arising from
                these terms shall be resolved through arbitration in Kathmandu, Nepal.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                12. Changes to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms & Conditions at any time. Changes will be
                effective immediately upon posting. Continued use of our platform constitutes acceptance
                of the modified terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                13. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">📧 support@mobilityhub.com</p>
                <p className="text-gray-700 dark:text-gray-300">📞 +977-1-XXXXXXX</p>
                <p className="text-gray-700 dark:text-gray-300">📍 Kathmandu, Nepal</p>
              </div>
            </section>

          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
            <p>By using MobilityHub, you agree to these Terms & Conditions.</p>
            <p className="mt-1">© {new Date().getFullYear()} MobilityHub. All rights reserved.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}