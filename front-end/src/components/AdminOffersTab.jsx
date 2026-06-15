import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminOffersTab() {
  const { token, API_BASE_URL, addNotification } = useApp();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/offers/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOffers(data.data);
      }
    } catch (err) {
      console.error(err);
      addNotification('Failed to fetch offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-[#1A1A1A]">Manage Offers</h2>
          <p className="text-sm text-slate-500 font-medium">View and manage all restaurant promotional offers.</p>
        </div>
        <button onClick={fetchOffers} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
          <Lucide.RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Lucide.Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Title</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Restaurant</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Owner</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Discount</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500 font-medium">
                      No offers found.
                    </td>
                  </tr>
                ) : (
                  offers.map(offer => (
                    <tr key={offer._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#1A1A1A]">{offer.title}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{offer.description}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{offer.restaurant?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{offer.owner?.name || 'N/A'}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${offer.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleToggleActive(offer)}
                            className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                            title={offer.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {offer.isActive ? <Lucide.ToggleRight size={16} className="text-emerald-500" /> : <Lucide.ToggleLeft size={16} />}
                          </button>
                          <button 
                            onClick={() => handleDelete(offer._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Lucide.Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
