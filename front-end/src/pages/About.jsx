import React from 'react';
import * as Lucide from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function About() {
  const { globalSettings } = useApp();
  const { general } = globalSettings;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-[#1A1A1A] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            Welcome to <span className="text-brand-500">{general.platformName}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
            At {general.platformName}, our mission is simple: {general.platformDescription || "connect customers with their favorite local restaurants through a fast, reliable, and convenient online ordering experience."}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* Intro Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 mb-16 border border-slate-100 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-black text-[#1A1A1A]">Bringing Restaurant-Quality Food to Your Doorstep</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              We believe great food should be just a few clicks away. Our platform enables customers to discover restaurants, browse menus, place orders, and track deliveries seamlessly from a single application.
            </p>
            <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">
              Whether you're craving traditional favorites, fast food, healthy meals, or specialty cuisine, {general.platformName} helps bring restaurant-quality food directly to your doorstep.
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500 rounded-3xl transform rotate-3 scale-105 opacity-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80" 
                alt="Delicious Food" 
                className="rounded-3xl shadow-lg relative z-10 w-full object-cover aspect-video"
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lucide.Target size={32} />
            </div>
            <h3 className="text-2xl font-black text-[#1A1A1A] mb-4">Our Mission</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              To provide a seamless digital ordering experience that helps restaurants reach more customers while offering users a convenient way to enjoy great food anytime.
            </p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-secondary-500/10 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-secondary-50 text-secondary-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lucide.Eye size={32} />
            </div>
            <h3 className="text-2xl font-black text-[#1A1A1A] mb-4">Our Vision</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              To become a trusted food ordering platform that empowers restaurants, delights customers, and simplifies food delivery for everyone.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="text-center mb-16 mt-24">
          <h2 className="text-3xl md:text-4xl font-black text-center text-[#1A1A1A] mb-12">
            Why Choose <span className="text-brand-500">{general.platformName}?</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto mb-12">
            We are committed to delivering the best experience for both our customers and our restaurant partners.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Lucide.Search, title: "Easy Discovery", desc: "Find the best local restaurants effortlessly." },
              { icon: Lucide.ShieldCheck, title: "Secure Ordering", desc: "Safe, encrypted online payments and ordering." },
              { icon: Lucide.MapPin, title: "Real-Time Tracking", desc: "Follow your order from the kitchen to your door." },
              { icon: Lucide.Tag, title: "Exclusive Offers", desc: "Get access to special restaurant promotions." },
              { icon: Lucide.Truck, title: "Fast Delivery", desc: "Reliable and quick delivery experience." },
              { icon: Lucide.Smartphone, title: "User-Friendly", desc: "An intuitive platform designed for everyone." },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 mb-4">
                  <feature.icon size={24} />
                </div>
                <h4 className="text-lg font-bold text-[#1A1A1A] mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-500 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-brand-500 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-xl shadow-brand-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full mix-blend-overlay -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full mix-blend-overlay translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4">Ready to Order?</h2>
            <p className="text-lg text-slate-300 font-medium mb-8 max-w-2xl mx-auto">
              Join {general.platformName} today and experience the easiest way to get your favorite meals delivered fast and fresh.
            </p>
            <Link to="/register" className="inline-block px-8 py-3.5 bg-white text-brand-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              Create an Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
