import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import RestaurantCard from '../components/RestaurantCard';

import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { API_BASE_URL, token, user, targetSection, setTargetSection, addNotification } = useApp();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('-rating');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const cuisinesList = ['South Indian', 'Biryani', 'Chettinad', 'Tiffin', 'Meals', 'Italian', 'American', 'Asian', 'Healthy', 'Vegetarian'];

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/restaurants?sort=${sort}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedCuisine) url += `&cuisine=${encodeURIComponent(selectedCuisine)}`;
      if (minRating) url += `&minRating=${minRating}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [search, minRating]);

  // Handle anchor scrolling
  useEffect(() => {
    if (targetSection) {
      setTimeout(() => {
        const el = document.getElementById(targetSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        setTargetSection(null);
      }, 100);
    }
  }, [targetSection, setTargetSection]);

  const handleCuisineClick = (cuisine) => {
    setSelectedCuisine(selectedCuisine === cuisine ? '' : cuisine);
  };

  // Filter restaurants locally for favorites if toggle is active
  const displayedRestaurants = showFavoritesOnly
    ? restaurants.filter((r) => favorites.includes(r._id))
    : restaurants;

  return (
    <div className="mx-auto pb-16">
      {/* Hero Section */}
      <div className="bg-[#FFF5EE] px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-20 md:pb-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-8 max-w-xl text-left">
            <h1 className="text-5xl sm:text-7xl font-black text-[#1A1A1A] leading-[1.1]">
              All Fast Food is Available at <span className="text-brand-500 relative">
                Foodie
                <span className="absolute bottom-1 left-0 w-full h-3 bg-brand-200/50 -z-10 rounded-full"></span>
              </span>
            </h1>

            <div className="flex items-center space-x-3 text-slate-500 font-medium text-sm">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
              <p>We Are Just A Click Away When You<br />Crave For Delicious Fast Food</p>
            </div>

            <div className="flex items-center space-x-6 pt-2">
              <button
                onClick={() => navigate(user ? '/user/restaurants' : '/restaurants')}
                className="px-8 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-lg shadow-brand-500/30 flex items-center space-x-2">
                <Lucide.ShoppingBag size={18} />
                <span>Buy Now</span>
              </button>
              <button className="flex items-center space-x-3 text-[#1A1A1A] font-bold text-sm hover:text-brand-500 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-brand-500 border border-slate-100">
                  <Lucide.Play size={18} fill="currentColor" />
                </div>
                <span>How To Order</span>
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-lg md:max-w-xl shrink-0">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-500/10 rounded-full blur-3xl -z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80&bg=transparent"
              alt="Delicious Burger"
              className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.25))' }}
            />
          </div>
        </div>
      </div>

      {/* Features Bar (Services) */}
      <div id="services" className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-10 z-20 scroll-mt-24">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-secondary-500/10 flex items-center justify-center text-secondary-500 shrink-0">
              <Lucide.Clock size={24} />
            </div>
            <div>
              <h4 className="font-bold text-[#1A1A1A] text-lg">Fast Delivery</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">The Food Will Be Delivered To<br />Your Home Within 1-2 Hours</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-16 bg-slate-100"></div>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-secondary-500/10 flex items-center justify-center text-secondary-500 shrink-0">
              <Lucide.RotateCw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-[#1A1A1A] text-lg">Fresh Food</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Your Food Will Be Delivered<br />100% Fresh To Your Home.</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-16 bg-slate-100"></div>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-secondary-500/10 flex items-center justify-center text-secondary-500 shrink-0">
              <Lucide.Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-[#1A1A1A] text-lg">Free Delivery</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Your Food Delivery Is<br />Absolutely Free. No Cost.</p>
            </div>
          </div>
        </div>
      </div>


      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-24">

        {/* Popular Dishes (Trending) */}
        <div id="popular" className="pt-8 scroll-mt-24 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A]">
              Trending <span className="text-brand-500">Popular</span> Dishes
            </h2>
            <p className="text-sm text-slate-500 font-medium max-w-sm">
              Discover the most loved dishes right now. Handpicked just for you!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4">
            {[
              { name: 'Crispy Masala Dosa', price: 6.99, img: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=400&h=300&fit=crop' },
              { name: 'Hyderabadi Chicken Biryani', price: 12.50, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop' },
              { name: 'Spicy Pepperoni Pizza', price: 14.99, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop' },
              { name: 'South Indian Meals', price: 9.99, img: 'https://images.unsplash.com/photo-1610190179968-ebbbda043236?w=400&h=300&fit=crop' }
            ].map((dish, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-2 transition-all">
                <div className="w-full h-40 rounded-2xl overflow-hidden mb-4 relative">
                  <img src={dish.img} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full text-brand-500 shadow-sm">
                    <Lucide.Heart size={14} className="fill-brand-500" />
                  </div>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map(star => <Lucide.Star key={star} size={12} className="fill-secondary-500 text-secondary-500" />)}
                </div>
                <h4 className="font-bold text-[#1A1A1A] mb-1 line-clamp-1">{dish.name}</h4>
                <div className="flex items-center justify-between w-full mt-auto pt-4">
                  <span className="font-black text-brand-500 text-lg">${dish.price.toFixed(2)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) addNotification('Please log in or create an account to continue.', 'error');
                    }}
                    className="p-2 bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-500 rounded-xl transition-colors"
                  >
                    <Lucide.ShoppingBag size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Delivered Categories (Offers) */}
        <div id="offers" className="pt-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A]">
              Best <span className="text-brand-500">Delivered</span><br />Categories
            </h2>
            <p className="text-sm text-slate-500 font-medium max-w-sm">
              Here Are Some Of Our Best Distributed Categories. If You Want You Can Order From Here.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cuisinesList.slice(0, 6).map((c, i) => {
              const isSelected = selectedCuisine === c;
              const images = [
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop", // Burger
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop", // Pizza
                "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=200&h=200&fit=crop", // Fries/American
                "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop", // Burger 2
                "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop", // Asian
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop", // Healthy
              ];
              return (
                <button
                  key={c}
                  onClick={() => handleCuisineClick(c)}
                  className={`group flex flex-col items-center p-4 rounded-3xl transition-all duration-300 ${isSelected ? 'bg-white shadow-xl shadow-brand-500/10 transform scale-105 border border-brand-100' : 'hover:bg-white hover:shadow-lg hover:border hover:border-slate-100'
                    }`}
                >
                  <div className={`w-24 h-24 rounded-full p-1 mb-4 transition-colors ${isSelected ? 'bg-brand-500' : 'bg-transparent group-hover:bg-brand-500'}`}>
                    <img src={images[i]} alt={c} className="w-full h-full object-cover rounded-full border-4 border-white" />
                  </div>
                  <h4 className="font-bold text-[#1A1A1A] text-sm mb-1">{c}</h4>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-brand-500' : 'text-slate-400 group-hover:text-brand-500'} flex items-center space-x-1`}>
                    <span>Order Now</span>
                    <Lucide.ChevronRight size={12} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Regular Menu / Restaurants Grid */}
        <div id="restaurants" className="scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A]">
              Our <span className="text-brand-500">Regular</span> Menu
            </h2>
            <p className="text-sm text-slate-500 font-medium max-w-sm">
              These Are Our Regular Menus. You Can Order Anything You Like.
            </p>
            <button onClick={() => navigate(user ? '/user/restaurants' : '/restaurants')} className="px-5 py-2.5 rounded-xl border-2 border-[#1A1A1A] text-[#1A1A1A] font-bold text-sm hover:bg-slate-50 transition-colors">
              Discover Local Eats
            </button>
          </div>

          {/* Filters Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white border border-slate-100 rounded-full p-2 pl-6 shadow-sm">
            {/* Toggle options */}
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              {token && (
                <button
                  onClick={() => navigate(user ? '/user/restaurants' : '/restaurants')}
                  className={`flex items-center space-x-2 text-sm font-bold transition-all ${showFavoritesOnly ? 'text-brand-500' : 'text-slate-500 hover:text-[#1A1A1A]'
                    }`}
                >
                  <Lucide.Heart size={16} className={showFavoritesOnly ? 'fill-brand-500' : ''} />
                  <span>Favorites</span>
                </button>
              )}

              {/* Rating filter */}
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
                <Lucide.Star size={16} className="text-secondary-500 fill-secondary-500" />
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="">Any Rating</option>
                  <option value="4.0">4.0+</option>
                  <option value="4.5">4.5+</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-50 rounded-full px-4 py-2">
              <Lucide.Search size={16} className="text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="bg-transparent border-none focus:outline-none text-sm font-medium w-32 md:w-48"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-2xl h-80 animate-pulse flex flex-col p-4 space-y-4 shadow-sm">
                  <div className="w-full aspect-video rounded-xl bg-slate-100"></div>
                  <div className="h-6 w-3/4 rounded bg-slate-100"></div>
                  <div className="h-4 w-1/2 rounded bg-slate-100"></div>
                  <div className="h-10 w-full rounded bg-slate-100 mt-auto"></div>
                </div>
              ))}
            </div>
          ) : displayedRestaurants.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="p-4 bg-slate-50 rounded-full w-14 h-14 flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
                <Lucide.Store size={24} />
              </div>
              <h4 className="font-black text-lg text-slate-800 mt-4">No Restaurants Found</h4>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto font-medium">
                We couldn't find any restaurants matching your selection. Try clearing your filters or changing your search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16 pt-12">
              {displayedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>

        {/* Discount Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-16">
          <div className="rounded-3xl bg-[#1A1A1A] p-8 relative overflow-hidden flex items-center h-64 shadow-xl">
            <div className="relative z-10 w-1/2 space-y-2">
              <h3 className="text-3xl font-black text-white">25%<br />Discount</h3>
            </div>
            <div className="absolute -right-8 -bottom-8 w-64 h-64">
              <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop" alt="Burger" className="w-full h-full object-cover rounded-full border-8 border-[#1A1A1A]" />
            </div>
            <div className="absolute top-8 right-12 bg-brand-500 text-white font-black text-xl px-4 py-2 transform rotate-12 rounded-lg shadow-lg">
              $2.60
            </div>
          </div>

          <div className="space-y-6 flex flex-col h-64">
            <div className="rounded-3xl bg-[#8A5A19] flex-1 relative overflow-hidden p-6 flex items-center shadow-lg">
              <div className="absolute left-6 top-6 bg-white text-[#8A5A19] font-black px-3 py-1 rounded-lg transform -rotate-12 shadow-sm">
                $3.80
              </div>
              <div className="w-1/2 text-right absolute right-6">
                <h3 className="text-2xl font-black text-white">Save<br />20%</h3>
              </div>
              <img src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop" alt="Dessert" className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 object-cover translate-y-1/4" />
            </div>

            <div className="rounded-3xl bg-[#FFD166] flex-1 relative overflow-hidden p-6 flex items-center shadow-lg">
              <div className="w-1/2 relative z-10 space-y-1">
                <h3 className="text-xl font-black text-[#1A1A1A]">Tortilla Warp Tacos</h3>
                <p className="text-xs font-bold text-brand-600">Get Your Order Fresh</p>
              </div>
              <div className="w-1/2 text-right absolute right-6 z-10">
                <h3 className="text-3xl font-black text-white">15%<br />Off</h3>
              </div>
              <img src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&h=200&fit=crop" alt="Tacos" className="absolute bottom-0 right-1/4 w-48 object-cover translate-y-1/4 opacity-90" />
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div id="testimonials" className="pb-12 scroll-mt-24">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A]">
              What Our <span className="text-brand-500">Customers</span> Say
            </h2>
            <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
              Don't just take our word for it. Hear what others have to say about Foodie.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", review: "The food is always fresh and hot. Best delivery service in town!" },
              { name: "Michael Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", review: "Super fast delivery and amazing food quality. Highly recommended." },
              { name: "Emma Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", review: "Great app interface and very easy to track orders. I love Foodie!" }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-16 h-16 rounded-full mb-4 border-4 border-brand-50 shadow-sm" />
                <div className="flex items-center space-x-1 text-secondary-500 mb-4">
                  {[1, 2, 3, 4, 5].map(star => <Lucide.Star key={star} size={16} className="fill-current" />)}
                </div>
                <p className="text-sm text-slate-600 font-medium italic mb-6">"{testimonial.review}"</p>
                <h4 className="font-bold text-[#1A1A1A] mt-auto">{testimonial.name}</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">Verified Customer</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call-to-Action Section */}
        {!user && (
          <div className="bg-[#1A1A1A] rounded-[40px] p-8 md:p-16 relative overflow-hidden text-center text-white my-12 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <Lucide.ShoppingBag size={48} className="mx-auto text-brand-500" />
              <h2 className="text-4xl md:text-5xl font-black">
                Hungry? Order your favorite food today!
              </h2>
              <p className="text-slate-400 font-medium">
                Join thousands of happy customers who get their cravings satisfied instantly. Sign up to unlock exclusive discounts and faster checkout.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => {
                    const loginBtn = document.querySelector('button.px-5.py-2.rounded-full.border.border-brand-500');
                    if (loginBtn) loginBtn.click();
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all shadow-lg shadow-brand-500/30"
                >
                  Create an Account
                </button>
                <button
                  onClick={() => {
                    const loginBtn = document.querySelector('button.text-brand-500.font-medium.text-sm.hover\\:text-brand-600');
                    if (loginBtn) loginBtn.click();
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all backdrop-blur-sm"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
    // </div>
  );
}
