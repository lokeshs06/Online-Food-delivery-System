import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const { user, token, API_BASE_URL, setTrackingOrderId, addNotification, clearCart, addToCart } = useApp();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          // Sort by newest first
          const sorted = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [API_BASE_URL, token]);

  const handleTrackClick = (orderId) => {
    setTrackingOrderId(orderId);
    navigate(`/user/orders/${orderId}`);
  };

  const handleReorder = (ord) => {
    clearCart();
    ord.items.forEach(i => {
      const itemObj = { _id: i.menuItem, name: i.name, price: i.price };
      addToCart(ord.restaurant._id, itemObj, i.quantity, i.customizations);
    });
    addNotification('Items added to cart for reorder', 'success');
    navigate('/user/checkout');
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'accepted': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'preparing': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'ready': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'out-for-delivery': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'delivered': 
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const activeStatuses = ['pending', 'accepted', 'preparing', 'ready', 'out-for-delivery'];
  const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
  const pastOrders = orders.filter(o => !activeStatuses.includes(o.status));

  const OrderCard = ({ ord }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-colors gap-4 shadow-sm">
      <div className="flex items-start space-x-4 min-w-0 text-left">
        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
          <img
            src={ord.restaurant.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80'}
            alt={ord.restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-sm text-[#1A1A1A] truncate">{ord.restaurant.name}</h4>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 border ${getStatusBadgeStyle(ord.status)}`}>
              {ord.status.replace(/-/g, ' ')}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString()}
          </p>
          <p className="text-xs text-slate-700 font-medium line-clamp-1 mt-1">
            {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
          </p>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 shrink-0 space-y-2">
        <span className="font-black text-sm text-brand-500 font-mono">${ord.totalAmount.toFixed(2)}</span>

        {activeStatuses.includes(ord.status) ? (
          <button
            onClick={() => handleTrackClick(ord._id)}
            className="mt-2 sm:mt-0 py-1.5 px-3 rounded-lg bg-brand-500 text-white font-bold text-[10px] hover:bg-brand-600 transition-colors shadow-sm flex items-center space-x-1"
          >
            <Lucide.Compass size={10} />
            <span>Track Order</span>
          </button>
        ) : (
          <div className="flex flex-col space-y-1.5 mt-2 sm:mt-0">
            {(ord.status === 'delivered' || ord.status === 'completed') && (
              <button
                onClick={() => handleReorder(ord)}
                className="w-full py-1.5 px-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 hover:bg-brand-100 transition-colors text-[10px] font-bold flex items-center justify-center space-x-1 shadow-sm"
              >
                <Lucide.RefreshCw size={10} />
                <span>Reorder</span>
              </button>
            )}
            <div className="flex space-x-1.5">
              {(ord.status === 'delivered' || ord.status === 'completed') && (
                <button
                  onClick={() => setSelectedInvoiceOrder(ord)}
                  className="flex-grow py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors text-[10px] font-bold flex items-center justify-center shadow-sm"
                >
                  <Lucide.FileText size={10} className="mr-1" />
                  Invoice
                </button>
              )}
              {(ord.status === 'delivered' || ord.status === 'completed') && (
                <button
                  onClick={() => handleTrackClick(ord._id)}
                  className="flex-grow py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors text-[10px] font-bold flex items-center justify-center shadow-sm"
                >
                  <Lucide.Star size={10} className="mr-1 text-brand-500" />
                  Review
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#1A1A1A]">My Orders</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Track, manage, and reorder your favorite meals.</p>
      </div>

      {loadingOrders ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white border border-slate-200 shadow-sm rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl text-slate-500">
          <Lucide.History size={32} className="mx-auto mb-2 text-slate-400" />
          <h3 className="font-bold text-slate-900 mb-1">No Orders Yet</h3>
          <p className="text-xs font-medium mb-4">You haven't placed any orders.</p>
          <button 
            onClick={() => navigate('/user/restaurants')}
            className="px-6 py-2 bg-brand-500 text-white rounded-full font-bold text-xs"
          >
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Active Orders</h2>
              <div className="space-y-4">
                {activeOrders.map(ord => <OrderCard key={ord._id} ord={ord} />)}
              </div>
            </div>
          )}

          {pastOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Past Orders</h2>
              <div className="space-y-4">
                {pastOrders.map(ord => <OrderCard key={ord._id} ord={ord} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-2">
                <Lucide.FileText size={18} className="text-brand-500" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">Order Invoice</h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm transition-colors"
              >
                <Lucide.X size={14} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center space-y-1">
                <h2 className="font-black text-xl text-[#1A1A1A]">{selectedInvoiceOrder.restaurant.name}</h2>
                <p className="text-xs text-slate-500 font-medium">Order #{selectedInvoiceOrder._id.slice(-8).toUpperCase()}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(selectedInvoiceOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-3">
                {selectedInvoiceOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-slate-600">
                      <span className="font-bold mr-1">{item.quantity}x</span>
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-dashed border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold">${selectedInvoiceOrder.totalAmount.toFixed(2)}</span>
                </div>
                
                {selectedInvoiceOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-brand-600 font-medium">
                    <span>Discount ({selectedInvoiceOrder.couponCode})</span>
                    <span className="font-bold">-${selectedInvoiceOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Payment Method</span>
                    <span className="font-bold text-slate-900 capitalize">{selectedInvoiceOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-sm text-slate-900">Total Paid</span>
                <span className="font-black text-xl text-brand-500">${selectedInvoiceOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button 
                onClick={() => setSelectedInvoiceOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
