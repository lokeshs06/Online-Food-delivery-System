import React from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
  const {
    setSelectedRestaurantId,
    setScrollToMenu,
    favorites,
    toggleFavorite,
    user,
    globalSettings
  } = useApp();

  const navigate = useNavigate();

  const isFavorite = favorites.includes(restaurant._id);
  const basePath = user && user.role === 'customer' ? '/user' : '';

  const handleClick = () => {
    setSelectedRestaurantId(restaurant._id);
    setScrollToMenu(false);
    navigate(`${basePath}/restaurants/${restaurant._id}`);
  };

  const handleViewMenu = (e) => {
    e.stopPropagation();
    setSelectedRestaurantId(restaurant._id);
    setScrollToMenu(true);
    navigate(`${basePath}/restaurants/${restaurant._id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(restaurant._id);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-4xl pt-20 pb-8 px-6 shadow-soft cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 flex flex-col h-full items-center text-center mt-16"
    >
      {/* Circular Image Overflowing Top */}
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full p-2 bg-transparent transition-transform duration-500 group-hover:scale-110">
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
          <img
            src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80'}
            alt={restaurant.name}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
      </div>

      {/* Favorite Toggle Button */}
      {user?.role === 'customer' && globalSettings?.customerSettings?.enableFavorites && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-20 right-6 p-2 rounded-full bg-white shadow-md hover:bg-slate-50 text-slate-400 hover:text-brand-500 transition-all duration-200 z-10"
        >
          <Lucide.Heart
            size={16}
            className={isFavorite ? 'fill-brand-500 text-brand-500' : 'text-slate-400'}
          />
        </button>
      )}

      {/* Details */}
      <h4 className="font-bold text-lg text-[#1A1A1A] line-clamp-1 w-full mb-1">
        {restaurant.name}
      </h4>

      {/* 5 Stars Rating */}
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Lucide.Star
            key={i}
            size={14}
            className={i < Math.floor(restaurant.rating) ? "fill-secondary-500 text-secondary-500" : "text-slate-300"}
          />
        ))}
        <span className="text-xs text-slate-500 font-medium ml-1">({restaurant.reviewsCount || 0})</span>
      </div>

      <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4">
        {restaurant.description}
      </p>

      {/* Price / Action Row */}
      <div className="flex items-center justify-between w-full mt-auto pt-4">
        <span className="font-black text-2xl text-[#1A1A1A]">
          {restaurant.priceRange === '$$$' ? '$20+' : restaurant.priceRange === '$$' ? '$10+' : '$5+'}
        </span>
        <button
          onClick={handleViewMenu}
          className="px-6 py-2.5 rounded-full border border-slate-200 text-[#1A1A1A] font-bold text-xs hover:border-brand-500 hover:text-brand-500 transition-colors bg-white shadow-sm"
        >
          View Menu
        </button>
      </div>
    </div>
  );
}
