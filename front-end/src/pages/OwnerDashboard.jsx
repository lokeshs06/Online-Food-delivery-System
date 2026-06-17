import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import OwnerOffersTab from '../components/OwnerOffersTab';

export default function OwnerDashboard() {
  const { API_BASE_URL, token, user, addNotification, globalSettings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('orders');
  
  // Sync tab with URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/owner/menu')) setActiveTab('menu');
    else if (path.includes('/owner/settings')) setActiveTab('settings');
    else if (path.includes('/owner/analytics')) setActiveTab('analytics');
    else if (path.includes('/owner/completed')) setActiveTab('completed');
    else setActiveTab('orders'); // default
  }, [location.pathname]);

  const [restaurant, setRestaurant] = useState(null);
  const [ownedRestaurants, setOwnedRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [hasFetchError, setHasFetchError] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs controlled by context now

  // Edit Restaurant Form
  const [restName, setRestName] = useState('');
  const [restDesc, setRestDesc] = useState('');
  const [restCuisine, setRestCuisine] = useState('');
  const [restLocation, setRestLocation] = useState('');
  const [restHoursOpen, setRestHoursOpen] = useState('09:00 AM');
  const [restHoursClose, setRestHoursClose] = useState('10:00 PM');
  const [restImage, setRestImage] = useState('');
  const [savingRest, setSavingRest] = useState(false);
  const [isCreatingRest, setIsCreatingRest] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Add/Edit Menu Item Form
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null means adding new
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('Mains');
  const [itemImage, setItemImage] = useState('');
  const [itemCalories, setItemCalories] = useState(400);
  const [itemProtein, setItemProtein] = useState('15g');
  const [itemCarbs, setItemCarbs] = useState('45g');
  const [itemFat, setItemFat] = useState('12g');
  const [itemAllergens, setItemAllergens] = useState('');
  const [savingItem, setSavingItem] = useState(false);

  // Reply Review Form
  const [replyReviewId, setReplyReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const loadRestaurantData = async (owned) => {
    setRestaurant(owned);
    setRestName(owned.name);
    setRestDesc(owned.description);
    setRestCuisine(owned.cuisine.join(', '));
    setRestLocation(owned.location);
    setRestHoursOpen(owned.hours.open);
    setRestHoursClose(owned.hours.close);
    setRestImage(owned.imageUrl);

    try {
      // Fetch specific menu and reviews
      const detailRes = await fetch(`${API_BASE_URL}/restaurants/${owned._id}`);
      const detailData = await detailRes.json();
      if (detailData.success) {
        setMenuItems(detailData.data.menuItems);
        setReviews(detailData.data.reviews);
      }

      // Fetch orders
      const ordersRes = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.data.filter(o => o.restaurant._id === owned._id));
      }
    } catch (err) {
      console.error(err);
      addNotification('Failed to fetch restaurant details', 'error');
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Get owner's restaurants
      const restRes = await fetch(`${API_BASE_URL}/restaurants`);
      const restData = await restRes.json();
      
      if (restData.success) {
        setHasFetchError(false);
        // Filter restaurants owned by this owner
        const ownedList = restData.data.filter(r => r.owner === (user.id || user._id));
        setOwnedRestaurants(ownedList);
        
        if (ownedList.length > 0) {
          // Default to the first one, or keep the currently selected one
          let target = ownedList[0];
          if (restaurant) {
            const existing = ownedList.find(r => r._id === restaurant._id);
            if (existing) target = existing;
          }
          await loadRestaurantData(target);
        }
      } else {
        setHasFetchError(true);
        addNotification(restData.error || 'Failed to fetch dashboard data', 'error');
      }
    } catch (err) {
      console.error(err);
      setHasFetchError(true);
      addNotification('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Create Restaurant Profile
  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setSavingRest(true);
    try {
      const res = await fetch(`${API_BASE_URL}/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: restName,
          description: restDesc,
          cuisine: restCuisine,
          location: restLocation,
          hours: { open: restHoursOpen, close: restHoursClose },
          imageUrl: restImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
          isApproved: globalSettings?.restaurantApproval?.autoApprove ? true : false
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification(
          globalSettings?.restaurantApproval?.autoApprove 
            ? 'Restaurant profile created and auto-approved!' 
            : 'Restaurant profile created! Pending admin approval.', 
          'success'
        );
        setIsCreatingRest(false);
        fetchDashboardData();
      } else {
        addNotification(data.error || 'Failed to create restaurant', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection error', 'error');
    } finally {
      setSavingRest(false);
    }
  };

  // Update Restaurant Profile
  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    setSavingRest(true);
    try {
      const res = await fetch(`${API_BASE_URL}/restaurants/${restaurant._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: restName,
          description: restDesc,
          cuisine: restCuisine,
          location: restLocation,
          hours: { open: restHoursOpen, close: restHoursClose },
          imageUrl: restImage
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('Restaurant profile updated!', 'success');
        setRestaurant(data.data);
      } else {
        addNotification(data.error || 'Failed to update restaurant', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection error', 'error');
    } finally {
      setSavingRest(false);
    }
  };

  // Delete Restaurant (Soft Delete)
  const handleDeleteRestaurant = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/restaurants/${restaurant._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        addNotification('Restaurant deleted successfully', 'success');
        
        setShowConfirmDelete(false);

        // Update the owned list
        const updatedOwned = ownedRestaurants.filter(r => r._id !== restaurant._id);
        setOwnedRestaurants(updatedOwned);

        if (updatedOwned.length > 0) {
          // Switch to the next available restaurant
          loadRestaurantData(updatedOwned[0]);
        } else {
          // No restaurants left, show creation form
          setRestaurant(null);
        }
        
        navigate('/owner/dashboard');
      } else {
        addNotification(data.error || 'Failed to delete restaurant', 'error');
        setShowConfirmDelete(false);
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection error', 'error');
      setShowConfirmDelete(false);
    }
  };

  // Update Order Status
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        addNotification(`Order status updated to: ${newStatus}`, 'success');
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      } else {
        addNotification(data.error || 'Failed to update order status', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection error', 'error');
    }
  };

  // Manage Menu Item Add/Edit submit
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setSavingItem(true);

    const payload = {
      restaurant: restaurant._id,
      name: itemName,
      description: itemDesc,
      price: parseFloat(itemPrice),
      category: itemCategory,
      imageUrl: itemImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      nutritionalInfo: {
        calories: parseInt(itemCalories),
        protein: itemProtein,
        carbs: itemCarbs,
        fat: itemFat,
        allergens: itemAllergens ? itemAllergens.split(',').map(a => a.trim()) : []
      }
    };

    try {
      let res;
      if (editingItem) {
        res = await fetch(`${API_BASE_URL}/menu/${editingItem._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE_URL}/menu`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        addNotification(editingItem ? 'Menu item updated!' : 'Menu item added!', 'success');
        setShowItemModal(false);
        setEditingItem(null);
        // Refresh menu items list
        const detailRes = await fetch(`${API_BASE_URL}/restaurants/${restaurant._id}`);
        const detailData = await detailRes.json();
        if (detailData.success) {
          setMenuItems(detailData.data.menuItems);
        }
      } else {
        addNotification(data.error || 'Failed to save menu item', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection failed', 'error');
    } finally {
      setSavingItem(false);
    }
  };

  // Delete menu item
  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        addNotification('Menu item deleted', 'success');
        setMenuItems(prev => prev.filter(i => i._id !== itemId));
      } else {
        addNotification(data.error || 'Failed to delete menu item', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection failed', 'error');
    }
  };

  // Toggle menu item availability (In Stock / Out of Stock)
  const handleToggleItemAvailability = async (item) => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });
      const data = await res.json();
      if (data.success) {
        addNotification(data.data.isAvailable ? 'Item marked as In Stock' : 'Item marked as Out of Stock', 'success');
        setMenuItems(prev => prev.map(i => i._id === item._id ? data.data : i));
      } else {
        addNotification(data.error || 'Failed to update availability', 'error');
      }
    } catch (err) {
      addNotification('Connection failed', 'error');
    }
  };

  // Open modal for editing menu item
  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDesc(item.description);
    setItemPrice(item.price);
    setItemCategory(item.category);
    setItemImage(item.imageUrl);
    setItemCalories(item.nutritionalInfo?.calories || 400);
    setItemProtein(item.nutritionalInfo?.protein || '15g');
    setItemCarbs(item.nutritionalInfo?.carbs || '45g');
    setItemFat(item.nutritionalInfo?.fat || '12g');
    setItemAllergens(item.nutritionalInfo?.allergens?.join(', ') || '');
    setShowItemModal(true);
  };

  // Open modal for adding new item
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemName('');
    setItemDesc('');
    setItemPrice('');
    setItemCategory('Mains');
    setItemImage('');
    setItemCalories(400);
    setItemProtein('15g');
    setItemCarbs('45g');
    setItemFat('12g');
    setItemAllergens('');
    setShowItemModal(true);
  };

  // Submit owner response to review
  const handleReviewReplySubmit = async (e) => {
    e.preventDefault();
    setSubmittingReply(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${replyReviewId}/response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ response: replyText })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('Reply submitted successfully!', 'success');
        setReviews(prev => prev.map(r => r._id === replyReviewId ? { ...r, response: replyText } : r));
        setReplyReviewId(null);
        setReplyText('');
      } else {
        addNotification(data.error || 'Failed to submit reply', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection failed', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading && !initialLoadDone) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (hasFetchError) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Lucide.AlertCircle size={48} className="text-rose-500" />
        <h2 className="text-xl font-bold text-slate-200">Connection Error</h2>
        <p className="text-slate-400">Failed to connect to the server. Please check if your backend server is running and your database is connected.</p>
        <button onClick={fetchDashboardData} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-bold text-sm">
          Retry Connection
        </button>
      </div>
    );
  }

  // If newly registered owner has no restaurant profile yet, render Creation Form
  if (initialLoadDone && (ownedRestaurants.length === 0 || isCreatingRest)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-left">
        <div className="space-y-2 text-center">
          <Lucide.Store size={48} className="text-brand-500 mx-auto" />
          <h2 className="text-2xl font-black text-[#1A1A1A]">Create Restaurant Profile</h2>
          <p className="text-xs text-slate-500 font-medium">
            Set up your restaurant menu, hours, and location to start receiving customer orders.
          </p>
        </div>

        <form onSubmit={handleCreateRestaurant} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Restaurant Name
              </label>
              <input
                type="text"
                required
                value={restName}
                onChange={(e) => setRestName(e.target.value)}
                placeholder="Bella Italia"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm transition-colors"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Description & Services
              </label>
              <textarea
                required
                value={restDesc}
                onChange={(e) => setRestDesc(e.target.value)}
                placeholder="Wood-fired pizzas and pasta made from organic imported ingredients..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm transition-colors placeholder:text-slate-400 h-20 resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Cuisines (comma separated)
              </label>
              <input
                type="text"
                required
                value={restCuisine}
                onChange={(e) => setRestCuisine(e.target.value)}
                placeholder="Italian, Pizza, Pasta"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Location Address
              </label>
              <input
                type="text"
                required
                value={restLocation}
                onChange={(e) => setRestLocation(e.target.value)}
                placeholder="123 Piazza Way, Food City"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Hours of Operation (Opening)
              </label>
              <input
                type="text"
                required
                value={restHoursOpen}
                onChange={(e) => setRestHoursOpen(e.target.value)}
                placeholder="11:00 AM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Hours of Operation (Closing)
              </label>
              <input
                type="text"
                required
                value={restHoursClose}
                onChange={(e) => setRestHoursClose(e.target.value)}
                placeholder="10:00 PM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Image Banner URL (Optional)
              </label>
              <input
                type="text"
                value={restImage}
                onChange={(e) => setRestImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2 mt-4">
            <button
              type="submit"
              disabled={savingRest}
              className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg disabled:opacity-50 transition-colors"
            >
              {savingRest ? 'Creating profile...' : 'Initialize Restaurant'}
            </button>
            {ownedRestaurants.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCreatingRest(false)}
                className="w-full py-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
      case 'accepted': return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'preparing': return 'bg-orange-50 text-orange-600 border border-orange-200';
      case 'ready': return 'bg-purple-50 text-purple-600 border border-purple-200';
      case 'out-for-delivery': return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const renderOrderCard = (ord, isActive) => (
    <div
      key={ord._id}
      className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 ${!isActive ? 'opacity-75' : ''}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <span className="text-[9px] font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 uppercase font-mono">
            ID: #{ord._id.slice(-6).toUpperCase()}
          </span>
          <h4 className="font-bold text-sm text-[#1A1A1A] mt-1">
            Customer: {ord.customer.name} ({ord.customer.email})
          </h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            Placed: {new Date(ord.createdAt).toLocaleString()}
            {ord.deliveredAt && ` • Delivered: ${new Date(ord.deliveredAt).toLocaleString()}`}
          </p>
        </div>
        
        {/* Delivery Address */}
        {ord.deliveryAddress && (
          <div className="flex-1 min-w-[200px] max-w-[300px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
            <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Lucide.MapPin size={12} className="text-brand-500" />
                <span>Delivery Details</span>
              </div>
              {ord.deliveryAddress.latitude && ord.deliveryAddress.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${ord.deliveryAddress.latitude},${ord.deliveryAddress.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-brand-600 hover:text-brand-700 hover:underline bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100 transition-colors"
                >
                  <Lucide.ExternalLink size={10} />
                  <span>View Map</span>
                </a>
              )}
            </h5>
            <p className="text-xs font-bold text-[#1A1A1A] mt-1">{ord.deliveryAddress.fullName}</p>
            <p className="text-[10px] text-slate-500 font-medium">
              📞 {ord.deliveryAddress.mobileNumber}
            </p>
            <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
              {ord.deliveryAddress.houseNumber && <>House No. {ord.deliveryAddress.houseNumber}<br/></>}
              {ord.deliveryAddress.street && <>{ord.deliveryAddress.street}<br/></>}
              {ord.deliveryAddress.area && `${ord.deliveryAddress.area}, `}{ord.deliveryAddress.city}<br/>
              {ord.deliveryAddress.state} - {ord.deliveryAddress.pinCode}<br/>
              <span className="font-semibold text-slate-700">{ord.deliveryAddress.country}</span>
              {ord.deliveryAddress.landmark && <><br/><span className="italic text-slate-500">Landmark: {ord.deliveryAddress.landmark}</span></>}
            </p>
          </div>
        )}

        {/* Update status dropdown OR Static Badge */}
        <div className="flex items-center space-x-2 shrink-0">
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Status:
          </label>
          {isActive ? (
            <select
              value={ord.status}
              onChange={(e) => handleOrderStatusUpdate(ord._id, e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-brand-500 cursor-pointer focus:outline-none focus:bg-white focus:border-brand-500 shadow-sm"
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing / In Progress</option>
              <option value="ready">Ready for Pickup</option>
              <option value="out-for-delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          ) : (
            <span className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusBadgeStyle(ord.status)}`}>
              {ord.status.replace(/-/g, ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Order items lists */}
      <div className="space-y-2 text-xs text-slate-900">
        {ord.items.map((i, idx) => (
          <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <span className="font-bold text-[#1A1A1A]">{i.quantity}x {i.name}</span>
              {i.customizations?.extras?.length > 0 && (
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Extras: {i.customizations.extras.join(', ')}
                </span>
              )}
              {i.customizations?.specialInstructions && (
                <span className="text-[10px] text-brand-500 italic block mt-0.5">
                  "{i.customizations.specialInstructions}"
                </span>
              )}
            </div>
            <span className="font-bold text-[#1A1A1A] font-mono">${(i.price * i.quantity).toFixed(2)}</span>
          </div>
        ))}
        
        <div className="flex justify-between items-center text-sm pt-2 text-[#1A1A1A] font-bold">
          <span>Total Income (Paid)</span>
          <span className="text-brand-500 font-mono">${ord.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Dashboard header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center flex-wrap gap-3">
            <h1 className="text-2xl sm:text-4xl font-black text-[#1A1A1A]">Owner Portal</h1>
            {ownedRestaurants.length > 0 && (
              <select
                value={restaurant._id}
                onChange={(e) => {
                  const target = ownedRestaurants.find(r => r._id === e.target.value);
                  if (target) loadRestaurantData(target);
                }}
                className="bg-white border border-slate-200 text-brand-500 shadow-sm text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {ownedRestaurants.map(r => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => {
                setRestName('');
                setRestDesc('');
                setRestCuisine('');
                setRestLocation('');
                setRestHoursOpen('09:00 AM');
                setRestHoursClose('10:00 PM');
                setRestImage('');
                setIsCreatingRest(true);
              }}
              className="p-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg flex items-center shadow-sm transition-colors"
              title="Add New Restaurant"
            >
              <Lucide.Plus size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-2">
            Managing <strong>{restaurant.name}</strong> • Rating: {restaurant.rating.toFixed(1)} ★ ({restaurant.reviewsCount || 0} reviews)
          </p>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {/* Tabs Nav */}
          {['orders', 'menu', 'offers', 'reviews', 'settings', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all whitespace-nowrap shrink-0 ${
                activeTab === tab
                  ? 'border-brand-500 bg-brand-50 text-brand-500 shadow-sm shadow-brand-500/10'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500 shadow-sm'
              }`}
            >
              {tab === 'analytics' ? 'Analytics / Reports' : tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tabs Container */}
      <div>
        
        {/* Tab 1: Orders list */}
        {activeTab === 'orders' && (() => {
          const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

          return (
            <div className="space-y-10">
              {/* Active Orders Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-[#1A1A1A]">Incoming & Active Orders</h3>
                {activeOrders.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 shadow-sm">
                    <Lucide.ShoppingBag size={32} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-medium">No active orders right now.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeOrders.map(ord => renderOrderCard(ord, true))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Tab: Completed Orders list */}
        {activeTab === 'completed' && (() => {
          const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

          return (
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-[#1A1A1A]">Completed & Cancelled Orders</h3>
                {pastOrders.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 shadow-sm">
                    <Lucide.CheckSquare size={32} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-medium">No past orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastOrders.map(ord => renderOrderCard(ord, false))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Tab 2: Manage Menu */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#1A1A1A]">Menu Catalog</h3>
              <button
                onClick={handleOpenAddItem}
                className="py-2 px-4 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition-colors flex items-center space-x-1"
              >
                <Lucide.PlusCircle size={14} />
                <span>Add Item</span>
              </button>
            </div>

            {menuItems.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 shadow-sm">
                <p className="text-xs font-medium">Your menu is empty. Add a new menu item to start selling.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 text-left">
                        <h4 className="font-bold text-sm text-[#1A1A1A] truncate">{item.name}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {item.category}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.isAvailable === false ? 'bg-rose-50 text-rose-500 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                            {item.isAvailable === false ? 'Out of Stock' : 'In Stock'}
                          </span>
                        </div>
                        <p className="font-black text-xs text-brand-500 mt-1">${item.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleToggleItemAvailability(item)}
                        title={item.isAvailable === false ? 'Mark as In Stock' : 'Mark as Out of Stock'}
                        className={`p-2 rounded-xl border shadow-sm transition-colors ${item.isAvailable === false ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white'}`}
                      >
                        {item.isAvailable === false ? <Lucide.CheckCircle size={14} /> : <Lucide.XCircle size={14} />}
                      </button>
                      <button
                        onClick={() => handleOpenEditItem(item)}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm"
                      >
                        <Lucide.Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item._id)}
                        className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-100 shadow-sm"
                      >
                        <Lucide.Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Customer Reviews reply */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-[#1A1A1A]">Customer Feedback</h3>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 shadow-sm">
                <p className="text-xs font-medium">No reviews left by customers yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 text-left shadow-sm"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <h4 className="font-bold text-xs text-[#1A1A1A]">{rev.userName}</h4>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Lucide.Star
                            key={i}
                            size={10}
                            className={i < rev.rating ? 'text-brand-500 fill-brand-500' : 'text-slate-200'}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-[#1A1A1A]">{rev.comment}</p>

                    {/* Response display / reply action */}
                    {rev.response ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 shadow-sm">
                        <div className="flex items-center space-x-1 text-brand-500">
                          <Lucide.CornerDownRight size={12} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Your Reply</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium italic">"{rev.response}"</p>
                      </div>
                    ) : replyReviewId === rev._id ? (
                      <form onSubmit={handleReviewReplySubmit} className="space-y-3">
                        <textarea
                          required
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Thank you for your review! We will definitely look into..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm h-16 resize-none"
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            type="submit"
                            disabled={submittingReply}
                            className="py-1.5 px-4 rounded-lg bg-brand-500 text-white font-bold text-[10px] hover:bg-brand-600 shadow-sm"
                          >
                            Submit Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyReviewId(null);
                              setReplyText('');
                            }}
                            className="py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-600 shadow-sm text-[10px] font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyReviewId(rev._id);
                          setReplyText('');
                        }}
                        className="py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-[10px] font-bold text-slate-700 shadow-sm"
                      >
                        Reply to Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Offers */}
        {activeTab === 'offers' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <OwnerOffersTab restaurantId={restaurant?._id} />
          </div>
        )}

        {/* Tab 4: Restaurant Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-[#1A1A1A]">Restaurant Settings</h3>

            <form onSubmit={handleUpdateRestaurant} className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    required
                    value={restName}
                    onChange={(e) => setRestName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Description & Services
                  </label>
                  <textarea
                    required
                    value={restDesc}
                    onChange={(e) => setRestDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Cuisines (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={restCuisine}
                    onChange={(e) => setRestCuisine(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Location Address
                  </label>
                  <input
                    type="text"
                    required
                    value={restLocation}
                    onChange={(e) => setRestLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Hours of Operation (Opening)
                  </label>
                  <input
                    type="text"
                    required
                    value={restHoursOpen}
                    onChange={(e) => setRestHoursOpen(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Hours of Operation (Closing)
                  </label>
                  <input
                    type="text"
                    required
                    value={restHoursClose}
                    onChange={(e) => setRestHoursClose(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Image Banner URL
                  </label>
                  <input
                    type="text"
                    value={restImage}
                    onChange={(e) => setRestImage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingRest}
                className="py-3 px-8 mt-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg disabled:opacity-50 transition-colors"
              >
                {savingRest ? 'Saving Changes...' : 'Save Restaurant Settings'}
              </button>
            </form>

            <div className="bg-red-50 border border-red-200 shadow-sm rounded-3xl p-6 space-y-4 mt-8">
              <h4 className="font-bold text-base text-red-600 flex items-center space-x-2">
                <Lucide.AlertTriangle size={18} />
                <span>Danger Zone</span>
              </h4>
              <p className="text-sm text-red-700">
                Deleting your restaurant will hide it from the platform immediately. Your historical orders and reviews will be preserved for data integrity, but this action cannot be undone.
              </p>
              {!showConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  Delete Restaurant
                </button>
              ) : (
                <div className="bg-red-100 p-4 rounded-xl border border-red-300 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <span className="text-red-800 font-bold text-sm">Are you absolutely sure?</span>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteRestaurant}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                    >
                      Yes, Delete It
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Analytics / Reports */}
        {activeTab === 'analytics' && (() => {
          if (orders.length === 0) {
            return (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#1A1A1A]">Performance Overview</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-[32px] p-12 text-center shadow-sm">
                  <Lucide.BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
                  <h4 className="font-bold text-lg text-slate-800 mb-2">No analytics data available yet.</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Analytics and reports will appear once customers start placing orders for your restaurant.
                  </p>
                </div>
              </div>
            );
          }

          // Order categorization
          const completedOrders = orders.filter(o => o.status === 'delivered');
          const cancelledOrders = orders.filter(o => o.status === 'cancelled');
          const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
          
          const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
          
          // Time-based calculations securely
          const now = new Date();
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          const todaysRevenue = completedOrders
            .filter(o => new Date(o.createdAt) >= todayStart)
            .reduce((sum, o) => sum + o.totalAmount, 0);

          const weeklyOrders = completedOrders.filter(o => new Date(o.createdAt) >= oneWeekAgo);
          const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

          const monthlyOrders = completedOrders.filter(o => new Date(o.createdAt) >= oneMonthAgo);
          const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

          // Find best selling item
          const itemCounts = {};
          orders.forEach(o => {
            o.items.forEach(i => {
              itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
            });
          });
          const bestSellingItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

          const avgRating = restaurant.rating || 0;

          return (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#1A1A1A]">Performance Overview</h3>
              </div>

              {/* Top Row: Total Lifetime Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
                    <Lucide.ShoppingBag size={16} />
                  </div>
                  <span className="text-3xl font-black text-[#1A1A1A]">{orders.length}</span>
                  <div className="text-[10px] font-bold text-emerald-500">{completedOrders.length} Completed</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pending Orders</span>
                    <Lucide.Clock size={16} className="text-brand-500" />
                  </div>
                  <span className="text-3xl font-black text-brand-500">{pendingOrders.length}</span>
                  <div className="text-[10px] font-bold text-slate-500">{cancelledOrders.length} Cancelled</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue</span>
                    <Lucide.DollarSign size={16} className="text-emerald-500" />
                  </div>
                  <span className="text-3xl font-black text-emerald-500 font-mono">${totalRevenue.toFixed(2)}</span>
                  <div className="text-[10px] font-bold text-slate-500">Lifetime</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Avg Rating</span>
                    <Lucide.Star size={16} className="text-amber-500" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-[#1A1A1A]">{avgRating.toFixed(1)} ⭐</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">{restaurant.reviewsCount || 0} Reviews</div>
                </div>
              </div>

              {/* Second Row: Time-based Revenue */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Today's Revenue</h4>
                    <span className="text-xl font-black text-[#1A1A1A] font-mono">${todaysRevenue.toFixed(2)}</span>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                    <Lucide.TrendingUp size={24} />
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Weekly Revenue</h4>
                    <span className="text-xl font-black text-[#1A1A1A] font-mono">${weeklyRevenue.toFixed(2)}</span>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{weeklyOrders.length} Orders</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                    <Lucide.BarChart2 size={24} />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monthly Revenue</h4>
                    <span className="text-xl font-black text-[#1A1A1A] font-mono">${monthlyRevenue.toFixed(2)}</span>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{monthlyOrders.length} Orders</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                    <Lucide.Calendar size={24} />
                  </div>
                </div>
              </div>

              {/* Bottom Row: Best Selling and Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Best Selling Item</h4>
                    <span className="text-xl font-black text-[#1A1A1A]">{bestSellingItem[0]}</span>
                    {bestSellingItem[1] > 0 && (
                      <p className="text-xs text-brand-500 font-bold mt-1">{bestSellingItem[1]} Orders Lifetime</p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
                    <Lucide.Award size={24} />
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Recent Order Activity</h4>
                    <div className="flex flex-col space-y-2 mt-3">
                      {orders.slice(0, 2).map((o, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 font-medium line-clamp-1 max-w-[120px]">Order #{o._id.substring(18)}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(o.status)}`}>
                            {o.status.replace(/-/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0 ml-4">
                    <Lucide.Activity size={24} />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>

      {/* Add/Edit Menu Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowItemModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <Lucide.X size={16} />
            </button>

            <h3 className="text-lg font-black text-[#1A1A1A] mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>

            <form onSubmit={handleItemSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Spicy Pepperoni Pizza"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Item Description
                </label>
                <textarea
                  required
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Double pepperoni, jalapeños, mozzarella cheese and spicy honey glaze..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="14.99"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500 shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white cursor-pointer focus:border-brand-500 shadow-sm"
                  >
                    <option value="Appetizers">Appetizers</option>
                    <option value="Mains">Mains</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Burgers">Burgers</option>
                    <option value="Sides">Sides</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Item Photo URL
                </label>
                <input
                  type="text"
                  value={itemImage}
                  onChange={(e) => setItemImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500 shadow-sm"
                />
              </div>

              {/* Nutritional facts edit */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm">
                <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                  <Lucide.Info size={12} className="text-brand-500" />
                  <span>Nutrition Facts</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-600 font-medium mb-1">Calories</label>
                    <input
                      type="number"
                      value={itemCalories}
                      onChange={(e) => setItemCalories(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 text-center shadow-sm focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-600 font-medium mb-1">Protein</label>
                    <input
                      type="text"
                      value={itemProtein}
                      onChange={(e) => setItemProtein(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 text-center shadow-sm focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-600 font-medium mb-1">Carbs</label>
                    <input
                      type="text"
                      value={itemCarbs}
                      onChange={(e) => setItemCarbs(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 text-center shadow-sm focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-600 font-medium mb-1">Fat</label>
                    <input
                      type="text"
                      value={itemFat}
                      onChange={(e) => setItemFat(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 text-center shadow-sm focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] text-slate-600 font-medium mb-1">Allergens (comma separated)</label>
                  <input
                    type="text"
                    value={itemAllergens}
                    onChange={(e) => setItemAllergens(e.target.value)}
                    placeholder="Dairy, Gluten, Nuts"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingItem}
                className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg disabled:opacity-50 transition-colors"
              >
                {savingItem ? 'Saving item...' : editingItem ? 'Save Item Changes' : 'Publish Menu Item'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
