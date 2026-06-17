import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Contact() {
  const { addNotification, globalSettings } = useApp();
  const { general } = globalSettings;
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending message
    addNotification('Your message has been sent successfully. We will get back to you soon!', 'success');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-[#1A1A1A] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            Get in <span className="text-brand-500">Touch</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            We would love to hear from you. Whether you have questions, feedback, partnership inquiries, or need assistance, our team is here to help.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Customer Support */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
                <Lucide.Headphones size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Customer Support</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Lucide.Mail size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <a href={`mailto:${general.supportEmail}`} className="text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">{general.supportEmail}</a>
                </div>
                <div className="flex items-start space-x-3">
                  <Lucide.Phone size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <a href={`tel:${general.supportPhone.replace(/\s+/g, '')}`} className="text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">{general.supportPhone}</a>
                </div>
                <div className="flex items-start space-x-3">
                  <Lucide.Clock size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-slate-600">Mon – Sun, 9:00 AM – 10:00 PM</p>
                </div>
              </div>
            </div>

            {/* Partnerships */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-secondary-50 text-secondary-500 flex items-center justify-center mb-4">
                <Lucide.Briefcase size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Business & Partnerships</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Interested in joining our platform as a restaurant partner?</p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Lucide.Mail size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <a href="mailto:partners@ofds.com" className="text-sm font-medium text-slate-600 hover:text-secondary-500 transition-colors">partners@ofds.com</a>
                </div>
                <div className="flex items-start space-x-3">
                  <Lucide.Mail size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <a href="mailto:business@ofds.com" className="text-sm font-medium text-slate-600 hover:text-secondary-500 transition-colors">business@ofds.com</a>
                </div>
              </div>
            </div>

            {/* Office Address */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mb-4">
                <Lucide.MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Office Address</h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                {general.businessAddress}
              </p>
            </div>

            {/* Follow Us */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Follow Us</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Stay updated with new restaurants, offers, and platform updates.</p>
              <div className="flex items-center space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 h-full">
              <div className="mb-8 border-b border-slate-100 pb-8">
                <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] mb-4">Send Us A Message</h2>
                <p className="text-sm text-slate-500 font-medium">
                  If you experience any issues with your account, orders, payments, or restaurant listings, please contact our support team and we will be happy to assist you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="How can we help you?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Write your message here..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium placeholder:text-slate-400 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full md:w-auto px-8 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg hover:shadow-brand-500/25 transition-all flex items-center justify-center space-x-2"
                >
                  <Lucide.Send size={18} />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
