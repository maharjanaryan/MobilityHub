// app/help/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Send,
  FileText,
  BookOpen,
  Video,
  Users,
  Shield,
  Calendar,
  CreditCard,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  LifeBuoy,
  Headphones,
  ArrowRight
} from 'lucide-react';
import HomeHeader from '../home/HomeHeader';
import Footer from '../component/Footer';


export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [supportTicket, setSupportTicket] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const faqs = [
    {
      id: '1',
      category: 'booking',
      question: 'How do I book a vehicle?',
      answer: 'To book a vehicle, simply browse our vehicle gallery, select your desired vehicle, choose your pickup and dropoff dates and locations, and complete the payment process. You will receive a confirmation email once your booking is confirmed.'
    },
    {
      id: '2',
      category: 'payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept various payment methods including credit/debit cards (Visa, MasterCard, American Express), PayPal, and digital wallets. All payments are processed securely through our encrypted payment gateway.'
    },
    {
      id: '3',
      category: 'cancellation',
      question: 'What is your cancellation policy?',
      answer: 'Cancellations made 48 hours before pickup receive a full refund. Cancellations within 24-48 hours receive a 50% refund. Cancellations within 24 hours are non-refundable. Please review our full cancellation policy for more details.'
    },
    {
      id: '4',
      category: 'insurance',
      question: 'Is insurance included?',
      answer: 'Basic insurance coverage is included with all bookings. This covers damage to the vehicle and third-party liability. Additional coverage options are available during checkout for extra protection.'
    },
    {
      id: '5',
      category: 'requirements',
      question: 'What documents do I need to rent a vehicle?',
      answer: 'You need a valid driver\'s license, a credit card for the security deposit, and identification (passport or national ID). International drivers may need an International Driving Permit (IDP).'
    },
    {
      id: '6',
      category: 'fuel',
      question: 'What is the fuel policy?',
      answer: 'Vehicles are provided with a full tank of fuel and should be returned with a full tank. If returned with less fuel, refueling charges will apply at market rates.'
    },
    {
      id: '7',
      category: 'age',
      question: 'Is there a minimum age requirement?',
      answer: 'The minimum age to rent a vehicle is 21 years. Drivers under 25 may be subject to a young driver surcharge. Some premium vehicles may have higher age requirements.'
    },
    {
      id: '8',
      category: 'support',
      question: 'What if I need roadside assistance?',
      answer: '24/7 roadside assistance is included with every booking. Call our emergency hotline at +1 (800) 123-4567 for immediate assistance.'
    },
    {
      id: '9',
      category: 'modification',
      question: 'Can I modify my booking?',
      answer: 'Yes, you can modify your booking up to 24 hours before pickup. Changes to dates, times, or vehicle type may affect pricing. Contact our support team for assistance.'
    },
    {
      id: '10',
      category: 'deposit',
      question: 'How does the security deposit work?',
      answer: 'A security deposit is held on your credit card at pickup and released within 7-10 business days after return, provided there is no damage or violation.'
    },
    {
      id: '11',
      category: 'booking',
      question: 'Can I cancel my booking online?',
      answer: 'Yes, you can cancel your booking directly from your account dashboard. Go to "My Bookings", select the booking, and click "Cancel Booking". The refund will be processed according to our cancellation policy.'
    },
    {
      id: '12',
      category: 'payment',
      question: 'When will my security deposit be refunded?',
      answer: 'Security deposits are typically refunded within 7-10 business days after the vehicle is returned, provided there is no damage, late return, or traffic violations.'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle, count: faqs.length },
    { id: 'booking', label: 'Bookings', icon: Calendar, count: faqs.filter(f => f.category === 'booking').length },
    { id: 'payment', label: 'Payments', icon: CreditCard, count: faqs.filter(f => f.category === 'payment').length },
    { id: 'cancellation', label: 'Cancellations', icon: AlertCircle, count: faqs.filter(f => f.category === 'cancellation').length },
    { id: 'insurance', label: 'Insurance', icon: Shield, count: faqs.filter(f => f.category === 'insurance').length },
    { id: 'requirements', label: 'Requirements', icon: FileText, count: faqs.filter(f => f.category === 'requirements').length },
    { id: 'support', label: 'Support', icon: LifeBuoy, count: faqs.filter(f => f.category === 'support').length }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    // Here you would send the ticket to your backend
    setTimeout(() => {
      setTicketSubmitted(false);
      setSupportTicket({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium'
      });
      alert('Support ticket submitted successfully! We will get back to you within 24 hours.');
    }, 1000);
  };

  return (
    <>
      <HomeHeader />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-green-700 to-green-600 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">How can we help you?</h1>
              <p className="text-lg text-green-100 mb-8">
                Find answers to common questions or contact our support team
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="         Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-24 pr-4 py-4 bg-white text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="max-w-7xl mx-auto px-6 -mt-8 mb-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow group border border-gray-100">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Headphones className="w-7 h-7 text-green-700" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm mb-3">Our team is available round the clock</p>
              <a href="tel:+18001234567" className="text-green-700 font-medium hover:text-green-800 inline-flex items-center gap-1">
                +1 (800) 123-4567 <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow group border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Mail className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-3">Get response within 24 hours</p>
              <a href="mailto:support@mobilityhub.com" className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center gap-1">
                support@mobilityhub.com <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow group border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <MessageCircle className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm mb-3">Chat with our support agents</p>
              <button className="text-purple-600 font-medium hover:text-purple-700 inline-flex items-center gap-1">
                Start Chat <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section - Full Width */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          {/* Section Header */}
          <div className="text-center mb-10 mt-10">
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Frequently Asked Questions</p>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Find quick answers to the most common questions about our service
            </p>
          </div>

          {/* Horizontal Category Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === category.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === category.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                    }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Results Count */}
          {searchQuery && (
            <div className="text-center text-sm text-gray-500 mb-6">
              Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </div>
          )}

          {/* FAQ Grid - Two Columns on Desktop */}
          {filteredFaqs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-6xl mx-auto">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`bg-white border rounded-xl overflow-hidden transition-all hover:shadow-md ${openFaq === faq.id ? 'border-green-300 shadow-md lg:col-span-2' : 'border-gray-200'
                    }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <HelpCircle className="w-4 h-4 text-green-700" />
                      </div>
                      <span className="font-medium text-gray-800 pr-4 text-base">{faq.question}</span>
                    </div>
                    {openFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-5 pb-5 pt-0 text-gray-600 border-t border-gray-100 bg-green-50/20">
                      <div className="pl-11 pt-4">
                        <p className="text-sm leading-relaxed">{faq.answer}</p>
                        <div className="mt-4 flex items-center gap-4">
                          <button className="text-xs text-gray-400 hover:text-green-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-green-50">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Helpful
                          </button>
                          <button className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-50">
                            <ThumbsDown className="w-3.5 h-3.5" />
                            Not helpful
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No results found</p>
              <p className="text-sm text-gray-400 mt-1">Try different keywords or browse categories</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 text-green-600 text-sm font-medium hover:bg-green-50 rounded-lg transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Still Need Help + Contact Form Section */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left: Still Need Help + Resources */}
              <div>
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white mb-8">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                      <Headphones className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Still need help?</h3>
                      <p className="text-green-100 text-sm">We&apos;re here for you 24/7</p>
                    </div>
                  </div>
                  <p className="text-green-100 mb-6">
                    Can&apos;t find what you&apos;re looking for? Our support team is ready to assist you with any questions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="tel:+18001234567"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-green-700 rounded-lg font-medium hover:shadow-lg transition-shadow text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      Call Support
                    </a>
                    <a
                      href="mailto:support@mobilityhub.com"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-400 transition-colors text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Email Us
                    </a>
                  </div>
                </div>

                {/* Additional Resources */}
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  Additional Resources
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/help/guides" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <BookOpen className="w-6 h-6 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800">User Guides</h4>
                      <p className="text-sm text-gray-500">Step-by-step tutorials</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0" />
                  </Link>

                  <Link href="/help/videos" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800">Video Tutorials</h4>
                      <p className="text-sm text-gray-500">Watch how-to videos</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0" />
                  </Link>

                  <Link href="/community" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800">Community Forum</h4>
                      <p className="text-sm text-gray-500">Connect with other users</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0" />
                  </Link>

                  <Link href="/help/policies" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800">Terms & Policies</h4>
                      <p className="text-sm text-gray-500">Read our policies</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Right: Contact Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Submit a Support Ticket</h2>
                    <p className="text-sm text-gray-500">Our team will assist you within 24 hours</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={supportTicket.name}
                        onChange={(e) => setSupportTicket({ ...supportTicket, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={supportTicket.email}
                        onChange={(e) => setSupportTicket({ ...supportTicket, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={supportTicket.subject}
                      onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={supportTicket.priority}
                      onChange={(e) => setSupportTicket({ ...supportTicket, priority: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Need assistance</option>
                      <option value="high">High - Urgent issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={supportTicket.message}
                      onChange={(e) => setSupportTicket({ ...supportTicket, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                      placeholder="Please provide detailed information about your issue..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={ticketSubmitted}
                    className="w-full px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {ticketSubmitted ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Ticket</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}