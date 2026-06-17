import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Restaurants() {
  const { API_BASE_URL } = useApp();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  
  const cuisinesList = ['South Indian', 'Biryani', 'Chettinad', 'Tiffin', 'Meals', 'Italian', 'American', 'Asian', 'Healthy', 'Vegetarian'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch restaurants
        let restUrl = `${API_BASE_URL}/restaurants?sort=-rating`;
        if (search) restUrl += `&search=${encodeURIComponent(search)}`;
        if (selectedCuisine) restUrl += `&cuisine=${encodeURIComponent(selectedCuisine)}`;
        
        const [restRes, offersRes] = await Promise.all([
          fetch(restUrl),
          fetch(`${API_BASE_URL}/offers`)
        ]);

        const restData = await restRes.json();
        const offersData = await offersRes.json();

        if (restData.success) {
          setRestaurants(restData.data);
        }
        if (offersData.success) {
          setOffers(offersData.data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, selectedCuisine, API_BASE_URL]);

  return (
    <div className="bg-white min-h-screen pb-16 font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-24">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
          <div className="relative z-10 w-full md:w-1/2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 text-[#1A1A1A] leading-tight">
              Discover Top<br /><span className="text-brand-500">Restaurants! 🍔</span>
            </h1>
            <p className="text-slate-500 font-medium mb-8 text-lg pr-4">What are you craving today? Explore the best food and exclusive deals in your town.</p>
            <div className="relative w-full max-w-md flex items-center bg-white rounded-full p-1.5 shadow-soft border border-slate-100">
               <Lucide.Search size={22} className="text-slate-400 ml-4 shrink-0" />
               <input 
                 type="text" 
                 placeholder="Search food or restaurant..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="bg-transparent border-none focus:outline-none px-4 py-3 w-full text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400"
               />
               <button className="bg-brand-500 text-white px-6 py-3 rounded-full font-bold shadow-md shadow-brand-500/30 hover:bg-brand-600 transition-colors whitespace-nowrap shrink-0">
                 Search
               </button>
            </div>
          </div>
          <div className="hidden md:flex w-1/2 justify-center">
             <div className="w-80 h-80 rounded-full bg-brand-50 opacity-60 blur-3xl"></div>
          </div>
        </div>

        {/* Active Offers Section */}
        {offers.length > 0 && (
          <div className="space-y-10">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] inline-block">
                Exclusive <span className="relative">
                  Offers
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-500" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
              {offers.slice(0, 3).map(offer => (
                <div key={offer._id} onClick={() => navigate(`/restaurants/${offer.restaurant._id}`)} className="bg-white rounded-4xl p-6 shadow-soft hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative mt-6">
                  <div className="absolute -top-10 w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 font-black text-xl border-[6px] border-white shadow-sm">
                    {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`}
                  </div>
                  <div className="pt-10 w-full">
                    <h3 className="font-bold text-lg text-[#1A1A1A] line-clamp-1">{offer.title}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1 mb-4 line-clamp-1">{offer.restaurant.name}</p>
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full uppercase tracking-wider inline-block">Valid till {new Date(offer.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            {offers.length > 3 && (
               <div className="text-center mt-8">
                 <button onClick={() => navigate('/offers')} className="px-8 py-3 rounded-full bg-brand-50 text-brand-600 font-bold hover:bg-brand-500 hover:text-white transition-colors">See All Offers →</button>
               </div>
            )}
          </div>
        )}

        {/* Cuisines Filter */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-[#1A1A1A]">Cuisines</h2>
          <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
             {cuisinesList.map(cuisine => (
               <button 
                 key={cuisine}
                 onClick={() => setSelectedCuisine(selectedCuisine === cuisine ? '' : cuisine)}
                 className={`shrink-0 px-4 py-2 rounded-full font-bold text-xs border transition-colors ${selectedCuisine === cuisine ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-500'}`}
               >
                 {cuisine}
               </button>
             ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#1A1A1A]">Available Restaurants</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4].map(n => <div key={n} className="bg-white h-64 rounded-3xl animate-pulse"></div>)}
            </div>
          ) : restaurants.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
               <Lucide.Store size={48} className="mx-auto text-slate-300 mb-4" />
               <h3 className="text-xl font-bold text-slate-800">No restaurants found</h3>
               <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search query.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurants.map(restaurant => {
                const isOpen = restaurant.isActive;
                const isAccepting = restaurant.isAcceptingOrders !== false;
                const available = isOpen && isAccepting;

                return (
                  <div key={restaurant._id} onClick={() => navigate(`/restaurants/${restaurant._id}`)} className={`bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group ${!available && 'opacity-75 grayscale-[0.5]'}`}>
                    <div className="h-48 relative overflow-hidden bg-slate-100">
                      <img src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      
                      {/* Availability Badge */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm ${available ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {available ? 'Accepting Orders' : 'Currently Closed'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-[#1A1A1A] line-clamp-1">{restaurant.name}</h3>
                        <div className="flex items-center space-x-1 bg-brand-50 text-brand-600 px-2 py-0.5 rounded-lg">
                          <Lucide.Star size={12} className="fill-brand-500" />
                          <span className="text-xs font-bold">{restaurant.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-4">{restaurant.cuisine.join(' • ')}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center space-x-1 text-slate-500">
                          <Lucide.Clock size={14} />
                          <span className="text-xs font-medium">30-45 min</span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-500">
                          <Lucide.Bike size={14} />
                          <span className="text-xs font-medium">Free</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
