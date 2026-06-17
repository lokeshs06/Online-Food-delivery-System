import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import MenuCustomizeModal from '../components/MenuCustomizeModal';
import { useParams, useNavigate } from 'react-router-dom';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    API_BASE_URL,
    token,
    addToCart,
    user,
    favorites,
    toggleFavorite,
    favoriteFoods,
    toggleFavoriteFood,
    scrollToMenu,
    setScrollToMenu,
    globalSettings,
  } = useApp();

  const menuRef = useRef(null);

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Customizer modal state
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Active Category filter
  const [activeCategory, setActiveCategory] = useState('All');

  const restaurantId = id || (typeof window !== 'undefined' ? localStorage.getItem('selectedRestaurantId') : null);

  // Load Restaurant detail
  useEffect(() => {
    const fetchDetails = async () => {
      if (!restaurantId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`);
        const data = await res.json();
        if (data.success) {
          setRestaurant(data.data.restaurant);
          setMenuItems(data.data.menuItems);
          setReviews(data.data.reviews);
        }
      } catch (err) {
        console.error('Failed to fetch restaurant details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [restaurantId, API_BASE_URL]);

  // Auto-scroll to menu section when "View Menu" was clicked on a card
  useEffect(() => {
    if (scrollToMenu && menuRef.current && !loading) {
      setTimeout(() => {
        menuRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setScrollToMenu(false);
      }, 150);
    }
  }, [scrollToMenu, loading]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8 text-center">
        <div className="w-full h-64 bg-slate-100 rounded-3xl"></div>
        <div className="h-8 w-1/3 bg-slate-100 rounded mx-auto"></div>
        <div className="h-4 w-1/2 bg-slate-100 rounded mx-auto"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="h-40 bg-slate-100 rounded-2xl"></div>
          <div className="h-40 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Lucide.AlertCircle size={48} className="text-rose-500" />
        <h2 className="text-2xl font-black text-slate-900">Restaurant Not Found</h2>
        <button
          onClick={() => navigate(user && user.role === 'customer' ? '/user/restaurants' : '/restaurants')}
          className="px-6 py-2.5 bg-brand-500 text-white rounded-full font-bold hover:bg-brand-600 transition-colors"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  // Get unique categories
  const categories = ['All', ...new Set(menuItems.map((item) => item.category))];

  // Filter items by category
  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter((item) => item.category === activeCategory);

  const handleOpenCustomize = (item) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedItem(item);
  };

  const handleCustomizeAdd = (qty, customizations) => {
    addToCart(restaurant._id, selectedItem, qty, customizations);
    setSelectedItem(null);
  };
  const isFavorite = favorites.includes(restaurant?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back to Explore button */}
      <button
        onClick={() => navigate(user && user.role === 'customer' ? '/user/restaurants' : '/restaurants')}
        className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors"
      >
        <Lucide.ArrowLeft size={14} />
        <span>Back to Explore</span>
      </button>

      {/* Banner / Hero header */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 h-64 sm:h-80 shadow-md">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        
        {/* Banner Details */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <div className="flex flex-wrap gap-1">
              {restaurant.cuisine.map((c) => (
                <span
                  key={c}
                  className="text-[10px] font-bold text-brand-300 bg-black/30 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-brand-500/30 uppercase tracking-wider"
                >
                  {c}
                </span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-none drop-shadow-sm">
              {restaurant.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed font-medium">
              {restaurant.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 font-medium">
              <div className="flex items-center space-x-1">
                <Lucide.Star size={14} className="text-brand-500 fill-brand-500" />
                <span className="font-bold text-white">{restaurant.rating.toFixed(1)}</span>
                <span>({restaurant.reviewsCount || 0} reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <Lucide.MapPin size={14} className="text-slate-300" />
                <span>{restaurant.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Lucide.Clock size={14} className="text-slate-300" />
                <span>{restaurant.hours.open} - {restaurant.hours.close}</span>
              </div>
            </div>
          </div>

          {/* Favorite Action button */}
          {(!user || user?.role === 'customer') && globalSettings?.customerSettings?.enableFavorites && (
            <button
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                toggleFavorite(restaurant._id);
              }}
              className="sm:shrink-0 flex items-center space-x-2 py-3 px-5 rounded-2xl bg-white/90 backdrop-blur-md border border-white hover:bg-white text-slate-800 transition-all font-bold text-xs shadow-lg active:scale-95"
            >
              <Lucide.Heart
                size={16}
                className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}
              />
              <span>{isFavorite ? 'Saved Favorite' : 'Save to Favorites'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Side menu, Right Side reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Menu Section (Left Side - 2 Cols) */}
        <div ref={menuRef} id="restaurant-menu" className="lg:col-span-2 space-y-6 scroll-mt-24">
          {/* Categories bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat
                    ? 'border-brand-500 bg-brand-50 text-brand-600 shadow-sm shadow-brand-500/10'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid - Modern Light Cards */}
          <div className="space-y-3 pt-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-500 font-medium">
                <Lucide.UtensilsCrossed size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No menu items found in this category.</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const outOfStock = item.isAvailable === false;
                // Assign a badge based on index / name heuristic
                const isPopular = item.name?.toLowerCase().includes('biryani') || item.name?.toLowerCase().includes('special') || item.price > 12;
                const isNew = item.name?.toLowerCase().includes('new') || item.name?.toLowerCase().includes('fresh');

                return (
                  <div
                    key={item._id}
                    onClick={() => !outOfStock && user?.role !== 'admin' && handleOpenCustomize(item)}
                    className={`group flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-white rounded-4xl shadow-soft hover:-translate-y-1 transition-all duration-300 ${
                      outOfStock
                        ? 'opacity-70 cursor-not-allowed'
                        : user?.role === 'admin'
                        ? ''
                        : 'cursor-pointer hover:shadow-xl'
                    }`}
                  >
                    {/* Food Image */}
                    <div className="relative w-32 h-32 shrink-0 rounded-3xl overflow-hidden bg-slate-50 shadow-sm border-[4px] border-white z-10">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        className={`object-cover w-full h-full transition-transform duration-300 ${!outOfStock ? 'group-hover:scale-110' : ''}`}
                        loading="lazy"
                      />
                      {/* Availability overlay */}
                      {outOfStock && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="text-[9px] font-black text-rose-500 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase tracking-wider">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col h-full">
                      {/* Top row: Name + Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
                          <h4 className="font-black text-lg text-[#1A1A1A] leading-tight line-clamp-1 text-center sm:text-left">
                            {item.name}
                          </h4>
                          {(!user || user?.role === 'customer') && globalSettings?.customerSettings?.enableFavorites && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!user) {
                                  navigate('/login');
                                  return;
                                }
                                toggleFavoriteFood(item._id);
                              }}
                              className="text-slate-300 hover:text-rose-500 transition-colors"
                              title={favoriteFoods?.some(f => f._id === item._id || f === item._id) ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Lucide.Heart
                                size={14}
                                className={favoriteFoods?.some(f => f._id === item._id || f === item._id) ? 'fill-rose-500 text-rose-500' : ''}
                              />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-1 shrink-0 mt-2 sm:mt-0">
                          {isPopular && !outOfStock && (
                            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-brand-50 text-brand-500 uppercase tracking-wider whitespace-nowrap">🔥 Popular</span>
                          )}
                          {isNew && !outOfStock && (
                            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 uppercase tracking-wider whitespace-nowrap">New</span>
                          )}
                        </div>
                      </div>

                      {/* Category + Stars */}
                      <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                          {item.category}
                        </span>
                        <div className="flex items-center space-x-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Lucide.Star
                              key={i}
                              size={10}
                              className={i < 4 ? 'fill-secondary-500 text-secondary-500' : 'text-slate-200'}
                            />
                          ))}
                          <span className="text-[10px] text-slate-400 font-medium ml-1">(4.0)</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-500 font-medium line-clamp-2 mt-3 leading-relaxed text-center sm:text-left">
                        {item.description}
                      </p>

                      {/* Bottom row: Price + Button */}
                      <div className="flex items-center justify-between mt-auto pt-4 w-full">
                        <div>
                          <span className="font-black text-2xl text-[#1A1A1A]">${item.price.toFixed(2)}</span>
                          {item.nutritionalInfo?.calories > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium ml-2">{item.nutritionalInfo.calories} kcal</span>
                          )}
                        </div>
                        {user?.role !== 'admin' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); if(!outOfStock) handleOpenCustomize(item); }}
                            disabled={outOfStock}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
                              outOfStock
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'border border-slate-200 text-[#1A1A1A] hover:border-brand-500 hover:text-brand-500 bg-white'
                            }`}
                          >
                            {outOfStock ? 'Unavailable' : 'Add to Cart'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>


        {/* Reviews Section (Right Side - 1 Col) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-slate-900">Customer Feedback</h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{reviews.length} reviews</span>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 font-medium">
                <Lucide.MessageSquare size={32} className="mx-auto mb-2 text-slate-400" />
                <p className="text-xs">No reviews yet. Be the first to leave a review!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{rev.userName}</h5>
                      <span className="text-[10px] font-medium text-slate-500">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Rating stars */}
                    <div className="flex items-center space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Lucide.Star
                          key={i}
                          size={10}
                          className={
                            i < rev.rating
                              ? 'text-brand-500 fill-brand-500'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed text-left">
                    {rev.comment}
                  </p>

                  {/* Restaurant Owner Response */}
                  {rev.response && (
                     <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-left mt-2">
                      <div className="flex items-center space-x-1.5">
                        <Lucide.CornerDownRight size={12} className="text-brand-500" />
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                          Owner Response
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium italic">
                        "{rev.response}"
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Menu Customize Modal */}
      {selectedItem && (
        <MenuCustomizeModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={handleCustomizeAdd}
        />
      )}
    </div>
  );
}
