import React from 'react';
import { Link } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { globalSettings } = useApp();
  const { general } = globalSettings || { general: { platformName: "Foodie" } };

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center group mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center mr-2 shadow-sm">
                <span className="font-bold text-white text-lg leading-none">F</span>
              </div>
              <span className="font-black text-xl tracking-tight text-[#1A1A1A]">
                {general.platformName}
              </span>
            </Link>
            <p className="text-sm text-slate-500 mb-6">
              Delivering happiness to your doorstep. The best food from top restaurants.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-bold text-[#1A1A1A] mb-4">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/restaurants" className="text-slate-500 hover:text-brand-500 transition-colors">Restaurants</Link></li>
              <li><Link to="/offers" className="text-slate-500 hover:text-brand-500 transition-colors">Offers</Link></li>
              <li><Link to="/about" className="text-slate-500 hover:text-brand-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-brand-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-[#1A1A1A] mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy-policy" className="text-slate-500 hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="text-slate-500 hover:text-brand-500 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-bold text-[#1A1A1A] mb-4">Account</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/login" className="text-slate-500 hover:text-brand-500 transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-slate-500 hover:text-brand-500 transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} {general.platformName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
