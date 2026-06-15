import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import OrderProgress from '../components/OrderProgress';

import { useParams, useNavigate } from 'react-router-dom';

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trackingOrderId: contextTrackingId, API_BASE_URL, token, addNotification } = useApp();
  const orderId = id || contextTrackingId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let interval;
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Poll every 4 seconds to catch status changes
    interval = setInterval(() => {
      fetchOrder();
    }, 4000);

    return () => clearInterval(interval);
  }, [orderId, token, API_BASE_URL]);

  const prevStatusRef = React.useRef(null);
  useEffect(() => {
    if (order && prevStatusRef.current && order.status !== prevStatusRef.current) {
      const getStatusMessage = (st) => {
        switch(st) {
          case 'accepted': return 'Your order has been accepted!';
          case 'preparing': return 'The restaurant is now preparing your food.';
          case 'ready': return 'Your order is ready for pickup!';
          case 'out-for-delivery': return 'Your order is out for delivery!';
          case 'delivered': return 'Your order has been delivered! Enjoy your meal.';
          case 'cancelled': return 'Your order has been cancelled.';
          default: return `Order status updated to ${st}`;
        }
      };
      // Only show success notification for non-cancelled status
      addNotification(getStatusMessage(order.status), order.status === 'cancelled' ? 'error' : 'success');
    }
    if (order) {
      prevStatusRef.current = order.status;
    }
  }, [order?.status]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurant: order.restaurant._id,
          order: order._id,
          rating,
          comment
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('Thank you for your feedback!', 'success');
        setReviewSubmitted(true);
      } else {
        addNotification(data.error || 'Failed to submit review', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${order._id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addNotification('Order cancelled successfully', 'success');
        setOrder(data.data);
      } else {
        addNotification(data.error || 'Failed to cancel order', 'error');
      }
    } catch (err) {
      addNotification('Connection error', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-6">
        <div className="h-10 w-1/3 bg-slate-100 rounded mx-auto"></div>
        <div className="h-60 w-full bg-slate-100 rounded-3xl"></div>
        <div className="h-32 w-full bg-slate-100 rounded-3xl"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Lucide.AlertCircle size={48} className="text-slate-400 mx-auto" />
        <h3 className="font-bold text-slate-900">Order not found</h3>
        <button
          onClick={() => navigate('/user/home')}
          className="px-4 py-2 bg-brand-500 rounded-xl text-white font-medium text-xs"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 text-left">
        <div>
          <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200 uppercase tracking-widest">
            Order #{order._id.slice(-6).toUpperCase()}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#1A1A1A] mt-1.5">
            Tracking your delivery
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Ordered from <strong>{order.restaurant.name}</strong> •{' '}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => navigate('/user/home')}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
          >
            Explore More
          </button>
          <button
            onClick={() => navigate('/user/orders')}
            className="px-6 py-2.5 bg-brand-500 text-white rounded-full font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
          >
            Order History
          </button>
          {['pending', 'accepted'].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Progress tracker component */}
      <OrderProgress order={order} />

      {/* Details list */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-[#1A1A1A] flex items-center space-x-2">
          <Lucide.ShoppingBag className="text-brand-500" size={18} />
          <span>Receipt Summary</span>
        </h3>
        
        <div className="space-y-2 text-xs">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-[#1A1A1A] font-medium">
              <span>{item.quantity}x {item.name}</span>
              <span className="font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="h-px bg-slate-200 my-2"></div>
          
          <div className="flex justify-between items-center font-black text-sm text-[#1A1A1A] pt-1">
            <span>Total Paid</span>
            <span className="text-brand-500 font-mono">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Feedback / Review form once delivered */}
      {order.status === 'delivered' && !reviewSubmitted && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 animate-in zoom-in-95 duration-300 shadow-sm">
          <div className="space-y-1 text-left">
            <h3 className="font-bold text-base text-[#1A1A1A] flex items-center space-x-2">
              <Lucide.Star className="text-brand-500 fill-brand-500 animate-spin-slow" size={18} />
              <span>Rate Your Experience</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              How was your meal from {order.restaurant.name} and the delivery? Let us know.
            </p>
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-4 text-left">
            {/* Star selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Rating
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-brand-500 transition-colors"
                  >
                    <Lucide.Star
                      size={24}
                      className={star <= rating ? 'fill-brand-500 text-brand-500' : 'text-slate-200'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Review Description
              </label>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Delicious pizza, delivery was lightning fast! Highly recommend."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors placeholder:text-slate-400 h-24 resize-none shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="py-3 px-8 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {submittingReview ? (
                <>
                  <Lucide.Loader size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Lucide.Sparkles size={14} />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Review Submitted Banner */}
      {reviewSubmitted && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-3 text-left shadow-sm">
          <Lucide.CheckCircle2 className="shrink-0" size={18} />
          <div>
            <strong>Feedback received!</strong> Thank you for helping the restaurant and courier improve.
          </div>
        </div>
      )}
    </div>
  );
}
