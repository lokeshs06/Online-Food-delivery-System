import React, { useState, useEffect } from "react";
import * as Lucide from "lucide-react";
import { useApp } from "../context/AppContext";

import {
  useNavigate,
  useLocation,
  Link,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

export default function Profile() {
  const {
    user,
    setUser,
    token,
    API_BASE_URL,
    logout,
    setTrackingOrderId,
    addNotification,
    clearCart,
    addToCart,
    favorites,
    toggleFavorite,
    favoriteFoods,
    toggleFavoriteFood,
    profileActiveTab,
    setProfileActiveTab,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  // Sync route with profileActiveTab
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/user/profile")) setProfileActiveTab("profile");
    else if (path.includes("/user/password")) setProfileActiveTab("password");
    else if (path.includes("/user/addresses")) setProfileActiveTab("addresses");
    else if (path.includes("/user/favorites")) setProfileActiveTab("favorites");
    else setProfileActiveTab("profile");
  }, [location.pathname, setProfileActiveTab]);

  // Profile edit
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState(
    user?.savedAddresses || [],
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Address form states
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressFullName, setAddressFullName] = useState(user?.name || "");
  const [addressMobileNumber, setAddressMobileNumber] = useState("");
  const [addressHouseNumber, setAddressHouseNumber] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressArea, setAddressArea] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressStateName, setAddressStateName] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [addressPinCode, setAddressPinCode] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [addressLatitude, setAddressLatitude] = useState(null);
  const [addressLongitude, setAddressLongitude] = useState(null);
  const [addressIsDefault, setAddressIsDefault] = useState(false);

  // Favorite items are now managed via AppContext (favoriteFoods)

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (data.success) {
        addNotification("Profile updated successfully!", "success");
      } else {
        addNotification(data.error || "Failed to update profile", "error");
      }
    } catch (err) {
      addNotification("Connection failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addNotification("New passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      addNotification("Password must be at least 6 characters", "error");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        addNotification("Password changed successfully!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        addNotification(data.error || "Failed to change password", "error");
      }
    } catch (err) {
      addNotification("Connection failed", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const resetAddressForm = () => {
    setAddressLabel("Home");
    setAddressFullName(user?.name || "");
    setAddressMobileNumber("");
    setAddressHouseNumber("");
    setAddressStreet("");
    setAddressArea("");
    setAddressCity("");
    setAddressStateName("");
    setAddressCountry("");
    setAddressPinCode("");
    setAddressLandmark("");
    setAddressLatitude(null);
    setAddressLongitude(null);
    setAddressIsDefault(false);
    setIsEditingAddress(false);
    setEditingAddressId(null);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      addNotification("Geolocation is not supported by your browser.", "error");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setAddressLatitude(latitude);
        setAddressLongitude(longitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          if (data && data.address) {
            setAddressHouseNumber(data.address.house_number || "");
            setAddressStreet(
              data.address.road ||
                data.address.pedestrian ||
                data.address.residential ||
                "",
            );
            setAddressArea(
              data.address.suburb ||
                data.address.neighbourhood ||
                data.address.hamlet ||
                "",
            );
            setAddressCity(
              data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.municipality ||
                "",
            );
            setAddressStateName(data.address.state || "");
            setAddressCountry(data.address.country || "");
            setAddressPinCode(data.address.postcode || "");
            addNotification("Location detected successfully!", "success");
          }
        } catch (err) {
          addNotification(
            "Failed to resolve address from coordinates.",
            "error",
          );
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error(error);
        addNotification("Location access denied or unavailable.", "error");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);

    const newAddress = {
      label: addressLabel,
      fullName: addressFullName,
      mobileNumber: addressMobileNumber,
      houseNumber: addressHouseNumber,
      street: addressStreet,
      area: addressArea,
      city: addressCity,
      state: addressStateName,
      country: addressCountry,
      pinCode: addressPinCode,
      landmark: addressLandmark,
      latitude: addressLatitude,
      longitude: addressLongitude,
      isDefault: addressIsDefault,
    };

    let updatedAddresses = [...savedAddresses];

    // Handle Default logic
    if (newAddress.isDefault || location.state?.fromCheckout) {
      updatedAddresses = updatedAddresses.map((a) => ({
        ...a,
        isDefault: false,
      }));
      newAddress.isDefault = true;
    } else if (updatedAddresses.length === 0) {
      // If it's the first address, make it default automatically
      newAddress.isDefault = true;
    }

    if (editingAddressId) {
      updatedAddresses = updatedAddresses.map((a) =>
        a._id === editingAddressId
          ? { ...newAddress, _id: editingAddressId }
          : a,
      );
    } else {
      updatedAddresses.push(newAddress);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/addresses`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ savedAddresses: updatedAddresses }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedAddresses(data.savedAddresses);
        setUser({ ...user, savedAddresses: data.savedAddresses });
        resetAddressForm();
        addNotification("Address saved successfully!", "success");
        
        if (location.state?.fromCheckout) {
          navigate("/user/checkout", { replace: true });
        }
      }
    } catch (err) {
      addNotification("Failed to save address", "error");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleRemoveAddress = async (id) => {
    const updated = savedAddresses.filter((a) => a._id !== id);
    // If we removed the default address, make the first remaining one default
    if (
      savedAddresses.find((a) => a._id === id)?.isDefault &&
      updated.length > 0
    ) {
      updated[0].isDefault = true;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/addresses`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ savedAddresses: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedAddresses(data.savedAddresses);
        setUser({ ...user, savedAddresses: data.savedAddresses });
        addNotification("Address removed", "success");
      }
    } catch (err) {
      addNotification("Failed to remove address", "error");
    }
  };

  const handleEditAddressClick = (addr) => {
    setAddressLabel(addr.label || "Home");
    setAddressFullName(addr.fullName || "");
    setAddressMobileNumber(addr.mobileNumber || "");
    setAddressHouseNumber(addr.houseNumber || "");
    setAddressStreet(addr.street || "");
    setAddressArea(addr.area || "");
    setAddressCity(addr.city || "");
    setAddressStateName(addr.state || "");
    setAddressCountry(addr.country || "");
    setAddressPinCode(addr.pinCode || "");
    setAddressLandmark(addr.landmark || "");
    setAddressLatitude(addr.latitude || null);
    setAddressLongitude(addr.longitude || null);
    setAddressIsDefault(addr.isDefault || false);
    setEditingAddressId(addr._id);
    setIsEditingAddress(true);
  };

  const tabs = [
    { key: "profile", label: "Edit Profile", icon: Lucide.User },
    { key: "password", label: "Password", icon: Lucide.Lock },
    { key: "addresses", label: "Addresses", icon: Lucide.MapPin },
    { key: "favorites", label: "Favorites", icon: Lucide.Heart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#1A1A1A] text-left">
            My Account
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {user?.email}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-500/15">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 py-2 px-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
          >
            <Lucide.LogOut size={12} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setProfileActiveTab(tab.key);
              navigate(`/user/${tab.key}`);
            }}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-4 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all ${
              profileActiveTab === tab.key
                ? "bg-white text-brand-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <tab.icon size={12} className="sm:block hidden" />
            <tab.icon size={10} className="sm:hidden" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* ── EDIT PROFILE ── */}
        {profileActiveTab === "profile" && (
          <div className="max-w-lg">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold text-lg text-[#1A1A1A] mb-5">
                Personal Information
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role?.replace("_", " ")}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 capitalize cursor-not-allowed"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {saving ? (
                    <>
                      <Lucide.Loader size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Lucide.Save size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── CHANGE PASSWORD ── */}
        {profileActiveTab === "password" && (
          <div className="max-w-lg">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold text-lg text-[#1A1A1A] mb-5">
                Change Password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPw ? (
                        <Lucide.EyeOff size={14} />
                      ) : (
                        <Lucide.Eye size={14} />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPw ? (
                        <Lucide.EyeOff size={14} />
                      ) : (
                        <Lucide.Eye size={14} />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm transition-colors"
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  <strong>Tip:</strong> Use at least 6 characters with a mix of
                  letters and numbers.
                </div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {savingPassword ? (
                    <>
                      <Lucide.Loader size={14} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Lucide.Lock size={14} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── SAVED ADDRESSES ── */}
        {profileActiveTab === "addresses" && (
          <div className="max-w-3xl space-y-4">
            {!isEditingAddress ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg text-[#1A1A1A]">
                    My Addresses
                  </h2>
                  <button
                    onClick={() => {
                      resetAddressForm();
                      setIsEditingAddress(true);
                    }}
                    className="py-2 px-4 rounded-xl bg-brand-50 border border-brand-200 text-xs font-bold text-brand-600 hover:bg-brand-100 transition-colors flex items-center space-x-1.5"
                  >
                    <Lucide.Plus size={14} />
                    <span>Add New Address</span>
                  </button>
                </div>

                {savedAddresses.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-3xl text-slate-400">
                    <Lucide.MapPin size={24} className="mx-auto mb-2" />
                    <p className="text-xs font-medium">
                      No saved addresses yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`p-4 bg-white border ${addr.isDefault ? "border-brand-500 shadow-md shadow-brand-500/10" : "border-slate-200 shadow-sm"} rounded-2xl relative`}
                      >
                        {addr.isDefault && (
                          <div className="absolute -top-2 -right-2 bg-brand-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            Default
                          </div>
                        )}
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
                            <Lucide.MapPin
                              size={14}
                              className="text-brand-500"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-[#1A1A1A]">
                              {addr.label || addr.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {addr.mobileNumber}
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-600 mb-4 line-clamp-2">
                          {addr.houseNumber &&
                            `House No. ${addr.houseNumber}, `}
                          {addr.street && `${addr.street}, `}
                          {addr.area && `${addr.area}, `}
                          {addr.city}
                        </p>
                        <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => handleEditAddressClick(addr)}
                            className="flex-1 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 text-[10px] font-bold flex items-center justify-center space-x-1"
                          >
                            <Lucide.Edit2 size={10} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleRemoveAddress(addr._id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <Lucide.Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="font-bold text-lg text-[#1A1A1A]">
                    {editingAddressId ? "Edit Address" : "Add New Address"}
                  </h2>
                  <button
                    onClick={() => setIsEditingAddress(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors"
                  >
                    <Lucide.X size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium">
                    Use location services to auto-fill address details.
                  </p>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={detectingLocation}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {detectingLocation ? (
                      <Lucide.Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Lucide.Navigation size={12} />
                    )}
                    <span>
                      {detectingLocation
                        ? "Detecting..."
                        : "Use Current Location"}
                    </span>
                  </button>
                </div>

                <form
                  onSubmit={handleSaveAddress}
                  className="space-y-4 pt-4 border-t border-slate-100"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Address Label (e.g., Home, Work)
                      </label>
                      <input
                        type="text"
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        required
                        placeholder="Home"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={addressFullName}
                        onChange={(e) => setAddressFullName(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={addressMobileNumber}
                        onChange={(e) => setAddressMobileNumber(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        House/Flat No.
                      </label>
                      <input
                        type="text"
                        value={addressHouseNumber}
                        onChange={(e) => setAddressHouseNumber(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Street
                      </label>
                      <input
                        type="text"
                        value={addressStreet}
                        onChange={(e) => setAddressStreet(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Area/Locality
                      </label>
                      <input
                        type="text"
                        value={addressArea}
                        onChange={(e) => setAddressArea(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={addressLandmark}
                        onChange={(e) => setAddressLandmark(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        State
                      </label>
                      <input
                        type="text"
                        value={addressStateName}
                        onChange={(e) => setAddressStateName(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        value={addressCountry}
                        onChange={(e) => setAddressCountry(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={addressPinCode}
                        onChange={(e) => setAddressPinCode(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressIsDefault}
                      onChange={(e) => setAddressIsDefault(e.target.checked)}
                      className="rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                    />
                    <label
                      htmlFor="isDefault"
                      className="text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      Set as Default Address
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="w-full sm:w-auto py-3 px-8 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 mt-4"
                  >
                    {savingAddress ? (
                      <>
                        <Lucide.Loader size={14} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Lucide.Save size={14} />
                        <span>Save Address</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ── FAVORITES ── */}
        {profileActiveTab === "favorites" && (
          <div className="space-y-6">
            {/* Favorite Restaurants */}
            <div>
              <h3 className="font-bold text-lg text-[#1A1A1A] mb-4 flex items-center space-x-2">
                <Lucide.Utensils size={18} className="text-brand-500" />
                <span>Favorite Restaurants</span>
              </h3>
              {favorites.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-3xl text-slate-400">
                  <Lucide.Heart size={24} className="mx-auto mb-2" />
                  <p className="text-xs font-medium">
                    No favorite restaurants yet. Explore and heart one!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((rest) => (
                    <div
                      key={rest._id || rest}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        if (rest._id) navigate(`/user/restaurants/${rest._id}`);
                      }}
                    >
                      {rest.imageUrl ? (
                        <img
                          src={rest.imageUrl}
                          alt={rest.name}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                          <Lucide.Store size={24} className="text-slate-400" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-bold text-sm text-[#1A1A1A]">
                          {rest.name || "Restaurant"}
                        </p>
                        {rest.location && (
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {rest.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite Food Items */}
            <div>
              <h3 className="font-bold text-lg text-[#1A1A1A] mb-4 flex items-center space-x-2">
                <Lucide.Heart size={18} className="text-brand-500" />
                <span>Favorite Dishes</span>
              </h3>
              {favoriteFoods?.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-3xl text-slate-400">
                  <Lucide.UtensilsCrossed size={24} className="mx-auto mb-2" />
                  <p className="text-xs font-medium">
                    No favorite dishes yet. Tap the heart on a dish to save it!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteFoods?.map((item) => (
                    <div
                      key={item._id || item}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-4 flex items-center justify-between"
                    >
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() =>
                          item.restaurant?._id &&
                          navigate(`/user/restaurants/${item.restaurant._id}`)
                        }
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            <Lucide.Pizza
                              size={18}
                              className="text-slate-400"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-xs text-[#1A1A1A] line-clamp-1">
                            {item.name || "Food Item"}
                          </p>
                          {item.restaurant?.name && (
                            <p className="text-[10px] text-slate-500 font-medium line-clamp-1">
                              {item.restaurant.name}
                            </p>
                          )}
                          {item.price && (
                            <p className="text-[10px] text-brand-500 font-bold mt-0.5">
                              ${item.price?.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavoriteFood(item._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors shrink-0"
                        title="Remove from favorites"
                      >
                        <Lucide.Heart size={16} className="fill-rose-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
