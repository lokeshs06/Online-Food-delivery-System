import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Offers() {
  const { token, API_BASE_URL } = useApp();
  const navigate = useNavigate();
  
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/offers`);
        const data = await res.json();
        if (data.success) {
          setOffers(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [API_BASE_URL]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-400 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl shadow-brand-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-black mb-4">Exclusive Offers</h1>
          <p className="text-brand-50 text-sm sm:text-base font-medium">
            Discover the best deals, discounts, and promotions from your favorite restaurants.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white border border-slate-200 shadow-sm rounded-3xl h-48 animate-pulse" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl text-slate-500">
          <Lucide.Tag size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="font-black text-xl text-slate-900 mb-2">No active offers right now</h3>
          <p className="text-sm font-medium">Check back later for exciting new deals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map(offer => (
            <div key={offer._id} className="group relative bg-white border border-slate-200 hover:border-brand-500 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col cursor-pointer" onClick={() => navigate(`/user/restaurants/${offer.restaurant._id}`)}>
              {/* Top Banner */}
              <div className="h-32 relative overflow-hidden bg-slate-100">
                <img 
                  src={offer.restaurant.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'} 
                  alt={offer.restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <h3 className="text-white font-black text-lg line-clamp-1 drop-shadow-md">{offer.restaurant.name}</h3>
                  <div className="bg-brand-500 text-white px-3 py-1 rounded-lg text-sm font-black shadow-lg">
                    {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `$${offer.discountValue} OFF`}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-bold text-[#1A1A1A] mb-2">{offer.title}</h4>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4 flex-1">
                  {offer.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                    <Lucide.Clock size={12} className="text-brand-500" />
                    <span>Valid till {new Date(offer.endDate).toLocaleDateString()}</span>
                  </div>
                  
                  <button className="flex items-center space-x-1 text-xs font-bold text-brand-600 group-hover:text-brand-500 transition-colors">
                    <span>Order Now</span>
                    <Lucide.ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
