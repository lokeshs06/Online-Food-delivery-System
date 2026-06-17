import React, { useState } from "react";
import * as Lucide from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const {
    cart,
    cartSubtotal,
    token,
    user,
    API_BASE_URL,
    clearCart,
    setTrackingOrderId,
    setProfileActiveTab,
    addNotification,
    globalSettings,
  } = useApp();

  const navigate = useNavigate();

  // Delivery options
  const [deliveryType, setDeliveryType] = useState("immediate"); // immediate, scheduled
  const [scheduledTime, setScheduledTime] = useState("");

  // Delivery Address State
  const defaultAddressId =
    user?.savedAddresses?.find((a) => a.isDefault)?._id ||
    (user?.savedAddresses?.length > 0 ? user.savedAddresses[0]._id : "");
  const [useSavedAddress, setUseSavedAddress] = useState(defaultAddressId);

  // Payment states
  const [paymentMethodType, setPaymentMethodType] = useState("card"); // card, cod
  const [useSavedCard, setUseSavedCard] = useState(
    user?.savedPaymentMethods?.length > 0
      ? user.savedPaymentMethods[0].token
      : "",
  );

  // New Card Form
  const [cardholderName, setCardholderName] = useState(user?.name || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Lucide.ShoppingBag size={48} className="text-slate-600 mx-auto" />
        <h3 className="font-bold text-slate-200">Your basket is empty</h3>
        <button
          onClick={() => navigate("/user/restaurants")}
          className="px-6 py-2.5 bg-brand-500 text-white rounded-full font-bold hover:bg-brand-600 transition-colors"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  // Format credit card number with spaces
  const handleCardNumberChange = (e) => {
    const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(" "));
    } else {
      setCardNumber(v);
    }
  };

  // Format expiry date (MM/YY)
  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      setExpiryDate(v.substring(0, 2) + "/" + v.substring(2, 4));
    } else {
      setExpiryDate(v);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/coupons/validate/${couponCode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.data);
        addNotification("Coupon applied successfully!", "success");
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error);
      }
    } catch (err) {
      setCouponError("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // Calculate Subtotals
  const deliveryFee = deliveryType === "immediate" ? 3.99 : 1.99;
  const tax = cartSubtotal * 0.08;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discount = cartSubtotal * (appliedCoupon.discountAmount / 100);
    } else if (appliedCoupon.discountType === "fixed") {
      discount = appliedCoupon.discountAmount;
    }
    // ensure discount doesn't exceed subtotal
    if (discount > cartSubtotal) discount = cartSubtotal;
  }

  const grandTotal = cartSubtotal + deliveryFee + tax - discount;

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Validate and prepare delivery address
      let finalAddress = null;
      if (useSavedAddress) {
        finalAddress = user.savedAddresses.find(
          (a) => a._id === useSavedAddress,
        );
      }

      if (!finalAddress) {
        addNotification(
          "Please select or provide a valid delivery address.",
          "error",
        );
        setSubmitting(false);
        return;
      }

      // Simulate Gateway Payment Processing Delay
      if (paymentMethodType === "card") {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // 2. If using a new card and "Save Card" is checked, save card first
      if (paymentMethodType === "card" && !useSavedCard && saveCard) {
        const cardType = cardNumber.startsWith("4") ? "Visa" : "Mastercard";
        const cardRes = await fetch(`${API_BASE_URL}/auth/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cardholderName,
            cardNumberLast4: cardNumber.slice(-4),
            expiryDate,
            cardType,
          }),
        });
        const cardData = await cardRes.json();
        if (!cardData.success) {
          addNotification("Failed to save credit card.", "error");
          setSubmitting(false);
          return;
        }
      }

      // Submit order to backend
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurant: cart[0].restaurantId,
          items: cart.map((c) => ({
            menuItem: c.item._id,
            quantity: c.quantity,
            customizations: c.customizations,
          })),
          paymentMethod:
            paymentMethodType === "cod"
              ? "cod"
              : useSavedCard
                ? "saved_card"
                : "card",
          deliveryType,
          scheduledTime:
            deliveryType === "scheduled" ? scheduledTime : undefined,
          coupon: appliedCoupon ? appliedCoupon.code : undefined,
          deliveryAddress: finalAddress,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addNotification("Order placed and paid successfully!", "success");
        clearCart();
        setTrackingOrderId(data.data._id);
        navigate(`/user/orders/${data.data._id}`);
      } else {
        addNotification(data.error || "Failed to place order", "error");
      }
    } catch (err) {
      console.error(err);
      addNotification("Payment processing failed. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/user/home")}
        className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors"
      >
        <Lucide.ArrowLeft size={14} />
        <span>Back to Restaurant</span>
      </button>

      <h1 className="text-2xl sm:text-4xl font-black text-[#1A1A1A] text-left">
        Checkout
      </h1>

      <form
        onSubmit={handlePlaceOrderSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 items-start"
      >
        {/* Left Options (2 Cols) */}
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          {/* Delivery Address */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-left">
            <h3 className="font-bold text-base text-[#1A1A1A] flex items-center space-x-2">
              <Lucide.MapPin className="text-brand-500" size={18} />
              <span>Delivery Address</span>
            </h3>

            {user?.savedAddresses && user.savedAddresses.length > 0 ? (
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Saved Addresses
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.savedAddresses.map((addr) => (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => setUseSavedAddress(addr._id)}
                      className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all relative ${
                        useSavedAddress === addr._id
                          ? "border-brand-500 bg-brand-50 text-brand-500 shadow-sm shadow-brand-500/10"
                          : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                      }`}
                    >
                      {useSavedAddress === addr._id && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                          <Lucide.Check size={10} className="text-white" />
                        </div>
                      )}
                      <span className="text-xs font-bold">
                        {addr.label || addr.fullName}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 line-clamp-2 pr-4">
                        {addr.houseNumber && `House No. ${addr.houseNumber}, `}
                        {addr.street && `${addr.street}, `}
                        {addr.area && `${addr.area}, `}
                        {addr.city}
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      navigate("/user/addresses", { state: { fromCheckout: true } });
                    }}
                    className="flex flex-col items-center justify-center space-y-1.5 p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 transition-all min-h-[90px]"
                  >
                    <Lucide.PlusCircle size={20} />
                    <span className="text-xs font-bold">Add New Address</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-2xl">
                <Lucide.MapPin
                  size={24}
                  className="mx-auto mb-2 text-slate-400"
                />
                <p className="text-xs font-medium text-slate-600 mb-4">
                  You have no saved addresses.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/user/addresses", { state: { fromCheckout: true } });
                  }}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <Lucide.Plus size={14} />
                  <span>Add New Address</span>
                </button>
              </div>
            )}
          </div>

          {/* Delivery Scheduling */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-[#1A1A1A] flex items-center space-x-2">
              <Lucide.Clock className="text-brand-500" size={18} />
              <span>Delivery Scheduling</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType("immediate")}
                className={`flex flex-col items-start p-4 rounded-3xl border text-left transition-all ${
                  deliveryType === "immediate"
                    ? "border-brand-500 bg-brand-50 text-brand-500 shadow-sm shadow-brand-500/10"
                    : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className="text-xs font-bold">Immediate Delivery</span>
                <span className="text-[10px] text-slate-500 mt-1">
                  Delivered in 20-35 mins ($3.99 fee)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType("scheduled")}
                className={`flex flex-col items-start p-4 rounded-3xl border text-left transition-all ${
                  deliveryType === "scheduled"
                    ? "border-brand-500 bg-brand-50 text-brand-500 shadow-sm shadow-brand-500/10"
                    : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className="text-xs font-bold">Schedule Delivery</span>
                <span className="text-[10px] text-slate-500 mt-1">
                  Select a specific slot ($1.99 fee)
                </span>
              </button>
            </div>

            {deliveryType === "scheduled" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-250">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Choose Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 transition-colors w-full sm:w-72 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Payments Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="font-bold text-base text-[#1A1A1A] flex items-center space-x-2">
              <Lucide.ShieldCheck className="text-brand-500" size={18} />
              <span>Secure Payment</span>
            </h3>

            {/* Payment Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethodType("card")}
                className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border transition-all ${
                  paymentMethodType === "card"
                    ? "border-brand-500 bg-brand-50 text-brand-500 shadow-sm shadow-brand-500/10"
                    : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Lucide.CreditCard size={18} />
                <span className="text-xs font-bold">Pay by Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethodType("cod")}
                className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border transition-all ${
                  paymentMethodType === "cod"
                    ? "border-brand-500 bg-brand-50 text-brand-500 shadow-sm shadow-brand-500/10"
                    : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Lucide.Banknote size={18} />
                <span className="text-xs font-bold">Cash on Delivery</span>
              </button>
            </div>

            {paymentMethodType === "card" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Saved Cards */}
                {user?.savedPaymentMethods &&
                  user.savedPaymentMethods.length > 0 && (
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        Use Saved Card
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.savedPaymentMethods.map((card) => (
                          <button
                            key={card.token}
                            type="button"
                            onClick={() => setUseSavedCard(card.token)}
                            className={`flex items-center space-x-3 p-4 rounded-2xl border text-left transition-all ${
                              useSavedCard === card.token
                                ? "border-brand-500 bg-brand-50 text-brand-500 shadow-sm shadow-brand-500/10"
                                : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                            }`}
                          >
                            <Lucide.CreditCard
                              size={18}
                              className="text-brand-500 shrink-0"
                            />
                            <div>
                              <p className="text-xs font-bold">
                                {card.cardType} •••• {card.cardNumberLast4}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Expires {card.expiryDate}
                              </p>
                            </div>
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => setUseSavedCard("")}
                          className={`flex items-center space-x-3 p-4 rounded-2xl border text-left transition-all ${
                            useSavedCard === ""
                              ? "border-brand-500 bg-brand-50 text-brand-500 shadow-sm shadow-brand-500/10"
                              : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                          }`}
                        >
                          <Lucide.PlusCircle
                            size={18}
                            className="text-slate-500 shrink-0"
                          />
                          <div>
                            <p className="text-xs font-bold">
                              Use a new credit card
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Enter card details below
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                {/* New Card Details Form */}
                {!useSavedCard && (
                  <div className="space-y-4 border-t border-slate-200 pt-4 animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold text-slate-800">
                      Credit Card Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required={!useSavedCard}
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 shadow-sm focus:bg-white focus:outline-none focus:border-brand-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required={!useSavedCard}
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength="19"
                          placeholder="4000 1234 5678 9010"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 shadow-sm focus:bg-white focus:outline-none focus:border-brand-500 transition-colors font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Expiration Date
                        </label>
                        <input
                          type="text"
                          required={!useSavedCard}
                          value={expiryDate}
                          onChange={handleExpiryChange}
                          maxLength="5"
                          placeholder="MM/YY"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 shadow-sm focus:bg-white focus:outline-none focus:border-brand-500 transition-colors font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          required={!useSavedCard}
                          value={cvc}
                          onChange={(e) =>
                            setCvc(e.target.value.replace(/[^0-9]/g, ""))
                          }
                          maxLength="3"
                          placeholder="•••"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 shadow-sm focus:bg-white focus:outline-none focus:border-brand-500 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="save_card"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded border-slate-300 bg-white text-brand-600 focus:ring-0 cursor-pointer"
                      />
                      <label
                        htmlFor="save_card"
                        className="text-xs text-slate-600 font-medium select-none cursor-pointer"
                      >
                        Save this card securely for future purchases
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethodType === "cod" && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-3 text-left animate-in fade-in duration-200 shadow-sm">
                <Lucide.Info className="shrink-0" size={18} />
                <div>
                  <strong>Pay at door:</strong> Please have the exact amount or
                  let the courier know if you need change.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Summary Panel (1 Col) */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
            <Lucide.Receipt className="text-brand-500" size={18} />
            <span>Order Summary</span>
          </h3>

          {/* Cart items list summary */}
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {cart.map((c, idx) => {
              const extrasPrice = (c.customizations?.extras?.length || 0) * 1.5;
              const totalItemPrice = (c.item.price + extrasPrice) * c.quantity;

              return (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs"
                >
                  <div className="min-w-0 flex-grow pr-3">
                    <p className="font-bold text-slate-900 line-clamp-1">
                      {c.quantity}x {c.item.name}
                    </p>
                    {c.customizations?.extras?.length > 0 && (
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        +{c.customizations.extras.join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-slate-900">
                    ${totalItemPrice.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="h-px bg-slate-200"></div>

          {/* Promo Code Section */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Promo Code
            </label>
            {!appliedCoupon ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-grow bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 transition-colors"
                >
                  {validatingCoupon ? "..." : "Apply"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-brand-50 border border-brand-200 p-2.5 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Lucide.Tag size={14} className="text-brand-500" />
                  <span className="text-xs font-bold font-mono text-brand-600">
                    {appliedCoupon.code} Applied
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Lucide.X size={14} />
                </button>
              </div>
            )}
            {couponError && (
              <p className="text-[10px] text-rose-500 font-medium">
                {couponError}
              </p>
            )}
          </div>

          <div className="h-px bg-slate-200"></div>

          {/* Pricing calculations */}
          <div className="space-y-2 text-xs text-slate-500 font-medium">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-900 font-bold">
                ${cartSubtotal.toFixed(2)}
              </span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-brand-500">
                <span className="flex items-center space-x-1">
                  <span>Discount ({appliedCoupon.code})</span>
                </span>
                <span className="font-bold">-${discount.toFixed(2)}</span>
              </div>
            )}

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

            <div className="h-px bg-slate-200 my-2"></div>

            <div className="flex justify-between text-sm text-[#1A1A1A] font-black">
              <span>Grand Total</span>
              <span className="text-brand-500 drop-shadow-sm">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Minimum Order Value Warning */}
          {cartSubtotal < (globalSettings?.orderManagement?.minimumOrderValue || 0) && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold flex items-start space-x-2">
              <Lucide.AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>
                Minimum order value is ${(globalSettings?.orderManagement?.minimumOrderValue || 0).toFixed(2)}. Add ${(globalSettings?.orderManagement?.minimumOrderValue - cartSubtotal).toFixed(2)} more to place order.
              </span>
            </div>
          )}

          {/* Place Order button */}
          <button
            type="submit"
            disabled={submitting || cartSubtotal < (globalSettings?.orderManagement?.minimumOrderValue || 0)}
            className="w-full py-4 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Lucide.Loader size={16} className="animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <Lucide.Sparkles size={16} />
                <span>Place Order & Pay</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
