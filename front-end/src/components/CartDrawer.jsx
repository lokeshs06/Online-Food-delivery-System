import React from "react";
import * as Lucide from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export default function CartDrawer({ isOpen, onClose }) {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    user,
    addNotification,
  } = useApp();

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      addNotification("Your cart is empty!", "warning");
      return;
    }
    if (!user) {
      addNotification("Please sign in to complete your checkout!", "warning");
      return;
    }
    navigate("/user/checkout");
    onClose();
  };

  const deliveryFee = 3.99;
  const tax = cartSubtotal * 0.08;
  const total = cartSubtotal > 0 ? cartSubtotal + deliveryFee + tax : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen sm:max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-350">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 shrink-0 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lucide.ShoppingBag className="text-brand-500" size={20} />
              <h3 className="font-bold text-lg text-slate-900">Your Basket</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 border border-slate-200 transition-colors"
            >
              <Lucide.X size={16} />
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 shadow-sm">
                  <Lucide.UtensilsCrossed size={48} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Basket is empty</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-[200px] mx-auto">
                    Browse restaurants and add delicious meals to start
                    ordering.
                  </p>
                </div>
              </div>
            ) : (
              cart.map((cartItem, idx) => {
                const extrasPrice =
                  (cartItem.customizations?.extras?.length || 0) * 1.5;
                const totalItemPrice =
                  (cartItem.item.price + extrasPrice) * cartItem.quantity;

                return (
                  <div
                    key={`${cartItem.item._id}-${idx}`}
                    className="flex space-x-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-sm"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded-full bg-slate-50 overflow-hidden shrink-0 p-1 border border-brand-100">
                      <img
                        src={cartItem.item.imageUrl}
                        alt={cartItem.item.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-sm text-[#1A1A1A] line-clamp-1">
                            {cartItem.item.name}
                          </h4>
                          <span className="font-black text-sm text-brand-500 ml-2 shrink-0">
                            ${totalItemPrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Customizations display */}
                        {cartItem.customizations && (
                          <div className="text-[10px] text-slate-500 font-medium space-y-0.5 mt-1">
                            {cartItem.customizations.extras?.length > 0 && (
                              <p className="line-clamp-1">
                                <strong>Extras:</strong>{" "}
                                {cartItem.customizations.extras.join(", ")}
                              </p>
                            )}
                            {cartItem.customizations.specialInstructions && (
                              <p className="line-clamp-1 italic text-slate-500">
                                "{cartItem.customizations.specialInstructions}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls & Delete */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
                          <button
                            onClick={() =>
                              updateCartQuantity(idx, cartItem.quantity - 1)
                            }
                            className="p-0.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                          >
                            <Lucide.Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-slate-900 w-5 text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(idx, cartItem.quantity + 1)
                            }
                            className="p-0.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                          >
                            <Lucide.Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Lucide.Trash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4 shrink-0">
              <div className="space-y-2 text-xs text-slate-500 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold">
                    ${cartSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-slate-900 font-bold">
                    ${deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="text-slate-900 font-bold">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-slate-200 text-[#1A1A1A] font-black">
                  <span>Grand Total</span>
                  <span className="text-brand-500 drop-shadow-sm">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <Lucide.CreditCard size={16} />
                <span>Proceed to Checkout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
