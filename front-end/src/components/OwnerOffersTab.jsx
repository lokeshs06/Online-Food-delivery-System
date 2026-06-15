import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OwnerOffersTab({ restaurantId }) {
  const { token, API_BASE_URL, addNotification } = useApp();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/offers/owner`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Only show offers for currently selected restaurant
        setOffers(data.data.filter(o => o.restaurant._id === restaurantId || o.restaurant === restaurantId));
      }
    } catch (err) {
      console.error(err);
      addNotification('Failed to fetch offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchOffers();
  }, [restaurantId]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title, description, discountType, discountValue: Number(discountValue),
          startDate, endDate, restaurant: restaurantId
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('Offer created successfully!', 'success');
        setShowAddModal(false);
        setTitle(''); setDescription(''); setDiscountValue(''); setStartDate(''); setEndDate('');
        fetchOffers();
      } else {
        addNotification(data.error || 'Failed to create offer', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/offers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addNotification('Offer deleted', 'success');
        fetchOffers();
      } else {
        addNotification(data.error || 'Failed to delete offer', 'error');
      }
    } catch (err) {
      addNotification('Connection error', 'error');
    }
  };

  const handleToggleActive = async (offer) => {
    try {
      const res = await fetch(`${API_BASE_URL}/offers/${offer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !offer.isActive })
      });
      const data = await res.json();
      if (data.success) {
        addNotification(`Offer ${offer.isActive ? 'deactivated' : 'activated'}`, 'success');
        fetchOffers();
      }
    } catch (err) {
      addNotification('Failed to toggle offer status', 'error');
    }
  };

  const handleEditClick = (offer) => {
    setEditingOffer(offer);
    setTitle(offer.title);
    setDescription(offer.description);
    setDiscountType(offer.discountType);
    setDiscountValue(offer.discountValue);
    setStartDate(new Date(offer.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(offer.endDate).toISOString().split('T')[0]);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/offers/${editingOffer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title, description, discountType, discountValue: Number(discountValue),
          startDate, endDate
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('Offer updated successfully!', 'success');
        setShowEditModal(false);
        setEditingOffer(null);
        setTitle(''); setDescription(''); setDiscountValue(''); setStartDate(''); setEndDate('');
        fetchOffers();
      } else {
        addNotification(data.error || 'Failed to update offer', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection error', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!restaurantId) {
    return <div className="text-center py-10 text-slate-500 text-sm">Please select a restaurant first.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-lg text-[#1A1A1A]">Manage Offers</h3>
          <p className="text-xs text-slate-500 font-medium">Create and manage discounts for your customers.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-brand-500 text-white rounded-xl font-bold text-xs hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Lucide.Plus size={14} />
          <span>New Offer</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Lucide.Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl text-slate-400">
          <Lucide.Tag size={32} className="mx-auto mb-2 text-slate-300" />
          <h4 className="font-bold text-slate-700 text-sm mb-1">No offers available</h4>
          <p className="text-xs font-medium">Create your first offer to attract more customers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map(offer => (
            <div key={offer._id} className={`bg-white border ${offer.isActive ? 'border-brand-200 shadow-sm' : 'border-slate-200 opacity-75'} rounded-2xl overflow-hidden`}>
              <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-[#1A1A1A]">{offer.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${offer.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mb-3 flex-1">{offer.description}</p>
                
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Discount:</span>
                    <span className="font-bold text-[#1A1A1A]">{offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>From: {new Date(offer.startDate).toLocaleDateString()}</span>
                    <span>To: {new Date(offer.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => handleToggleActive(offer)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${offer.isActive ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100' : 'bg-brand-50 text-brand-600 border-brand-200 hover:bg-brand-100'}`}
                  >
                    {offer.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleEditClick(offer)}
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 border border-indigo-100 hover:bg-indigo-100 transition-colors"
                    title="Edit"
                  >
                    <Lucide.Edit2 size={12} />
                  </button>
                  <button 
                    onClick={() => handleDelete(offer._id)}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100 transition-colors"
                    title="Delete"
                  >
                    <Lucide.Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-sm text-[#1A1A1A]">Create New Offer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <Lucide.X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500" placeholder="e.g. 50% Off First Order" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 h-20 resize-none" placeholder="Details about this offer..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Type</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Value</label>
                  <input type="number" required min="1" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500" placeholder="e.g. 10" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Start Date</label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">End Date</label>
                  <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500" />
                </div>
              </div>
              <button disabled={saving} type="submit" className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold text-xs hover:bg-brand-600 transition-colors disabled:opacity-50 mt-2">
                {saving ? 'Creating...' : 'Create Offer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-sm text-[#1A1A1A]">Edit Offer</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <Lucide.X size={16} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 h-20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Type</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Value</label>
                  <input type="number" required min="1" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Start Date</label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">End Date</label>
                  <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500" />
                </div>
              </div>
              <button disabled={saving} type="submit" className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold text-xs hover:bg-brand-600 transition-colors disabled:opacity-50 mt-2">
                {saving ? 'Saving...' : 'Update Offer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
