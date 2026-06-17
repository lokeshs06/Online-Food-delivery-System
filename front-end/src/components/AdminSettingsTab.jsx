import React, { useState, useEffect } from "react";
import * as Lucide from "lucide-react";
import { useApp } from "../context/AppContext";

// Default settings if nothing in localStorage
const defaultSettings = {
  general: {
    platformName: "OFDS Platform",
    platformDescription: "Premium Online Food Delivery System",
    supportEmail: "support@ofds.com",
    supportPhone: "+1 800 123 4567",
    businessAddress: "123 Food Street, Tech City, TC 10001",
    defaultCurrency: "USD",
    timeZone: "UTC",
  },
  appearance: { theme: "light", sidebarCollapse: false },
  notifications: {
    emailPreferences: true,
    newRegistration: true,
    newRestaurant: true,
    newOrder: true,
    newOffer: false,
    complaintAlerts: true,
  },
  restaurantApproval: {
    autoApprove: false,
    manualRequired: true,
    verificationRules: "Standard KYC Verification",
  },
  offerManagement: {
    requireApproval: true,
    autoExpire: true,
    maxDiscount: 50,
    featuredLimit: 5,
  },
  orderManagement: {
    cancelWindowMins: 10,
    autoCancelUnpaid: true,
    refundPolicy: "Full refund if cancelled within 10 minutes.",
  },
  customerSettings: {
    allowRegistration: true,
    requireVerification: false,
    enableFavorites: true,
    deactivationRules: "Manual intervention required",
  },
};
export default function AdminSettingsTab() {
  const { user, setUser, token, API_BASE_URL, addNotification, globalSettings, setGlobalSettings, defaultSettings } = useApp();
  const [activeSection, setActiveSection] = useState("general");

  // Account State
  const [accName, setAccName] = useState(user?.name || "");
  const [accEmail, setAccEmail] = useState(user?.email || "");
  const [accPhone, setAccPhone] = useState("");
  const [accSaving, setAccSaving] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [secSaving, setSecSaving] = useState(false);

  // Generic Settings State
  const [currentConfig, setCurrentConfig] = useState({});
  const [configSaving, setConfigSaving] = useState(false);

  // Update effect for settings changes
  useEffect(() => {
    setCurrentConfig(globalSettings[activeSection] || {});
  }, [activeSection, globalSettings]);

  const handleConfigChange = (key, value) => {
    // If it's a critical setting, confirm first
    if (key === "allowRegistration" && value === false) {
      if (!window.confirm("Are you sure you want to disable customer registration?")) return;
    }
    if (key === "enableFavorites" && value === false) {
      if (!window.confirm("Are you sure you want to disable Favorites?")) return;
    }
    
    setCurrentConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setConfigSaving(true);
    
    // Simulate API delay for realism
    await new Promise((r) => setTimeout(r, 800));

    const updatedSettings = {
      ...globalSettings,
      [activeSection]: currentConfig,
    };

    setGlobalSettings(updatedSettings);
    
    setConfigSaving(false);
    addNotification("Settings saved successfully", "success");
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setAccSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: accName, email: accEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, name: data.user.name, email: data.user.email });
        addNotification("Account profile updated", "success");
      } else {
        addNotification(data.error || "Failed to update profile", "error");
      }
    } catch (err) {
      addNotification("Connection failed", "error");
    } finally {
      setAccSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setSecSaving(true);
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
        addNotification("Password changed successfully", "success");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        addNotification(data.error || "Failed to change password", "error");
      }
    } catch (err) {
      addNotification("Connection failed", "error");
    } finally {
      setSecSaving(false);
    }
  };

  const handleSystemAction = (actionName) => {
    if (actionName === "Toggle Maintenance Mode") {
      const isCurrentlyMaintenance = globalSettings.maintenance?.maintenanceMode;
      const newStatus = !isCurrentlyMaintenance;
      const confirmMsg = newStatus 
        ? "Are you sure you want to ENABLE Maintenance Mode? Non-admin users will be blocked."
        : "Are you sure you want to DISABLE Maintenance Mode?";
      
      if (window.confirm(confirmMsg)) {
        setGlobalSettings(prev => ({
          ...prev,
          maintenance: { ...prev.maintenance, maintenanceMode: newStatus }
        }));
        addNotification(`Maintenance Mode ${newStatus ? 'enabled' : 'disabled'}.`, "success");
      }
      return;
    }

    if (actionName === "Reset To Default Settings") {
      if (window.confirm("Are you sure you want to reset ALL settings to their defaults? This cannot be undone.")) {
        setGlobalSettings(defaultSettings);
        addNotification("Settings reset to defaults.", "success");
      }
      return;
    }

    if (window.confirm(`Are you sure you want to execute: ${actionName}? This action may affect the system.`)) {
      addNotification(`Action "${actionName}" executed successfully.`, "success");
    }
  };

  const sections = [
    { id: "general", label: "General", icon: Lucide.Settings },
    { id: "account", label: "Account", icon: Lucide.UserCircle },
    { id: "security", label: "Security", icon: Lucide.ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Lucide.Bell },
    { id: "restaurantApproval", label: "Restaurant Approval", icon: Lucide.Store },
    { id: "offerManagement", label: "Offer Management", icon: Lucide.Tag },
    { id: "orderManagement", label: "Order Management", icon: Lucide.ShoppingBag },
    { id: "customerSettings", label: "Customer Settings", icon: Lucide.Users },
    { id: "appearance", label: "Appearance", icon: Lucide.Palette },
    { id: "dashboardPersonalization", label: "Dashboard Config", icon: Lucide.LayoutDashboard },
    { id: "systemHealth", label: "System Health", icon: Lucide.Activity },
    { id: "systemMaintenance", label: "System Maintenance", icon: Lucide.Wrench },
    { id: "about", label: "About System", icon: Lucide.Info },
  ];

  const renderContent = () => {
    if (activeSection === "account") {
      return (
        <form onSubmit={handleSaveAccount} className="space-y-6 animate-in fade-in duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Account Settings</h2>
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-3xl shrink-0 border-4 border-white shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <button type="button" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors">
                Change Picture
              </button>
              <p className="text-[10px] text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Full Name</label>
              <input type="text" required value={accName} onChange={(e) => setAccName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Email Address</label>
              <input type="email" required value={accEmail} onChange={(e) => setAccEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Phone Number</label>
              <input type="tel" value={accPhone} onChange={(e) => setAccPhone(e.target.value)} placeholder="+1 234 567 890" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={accSaving} className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 transition-colors">
              {accSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      );
    }

    if (activeSection === "security") {
      return (
        <div className="space-y-8 animate-in fade-in duration-300">
          <form onSubmit={handleSavePassword} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Security Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Current Password</label>
                <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">New Password</label>
                <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={secSaving} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md disabled:opacity-50 transition-colors">
                {secSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>

          <div className="border-t border-slate-200 pt-8 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Active Sessions</h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lucide.Monitor size={20} className="text-slate-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Windows • Chrome</p>
                  <p className="text-xs text-slate-500">Current Session • Last active just now</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Active</span>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => addNotification("Logged out of all other devices.", "success")} type="button" className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors">
                Logout From All Devices
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "systemMaintenance") {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-6">System Maintenance</h2>
          <p className="text-sm text-slate-500 mb-6">Perform critical system operations and administrative tasks. Use with caution.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <Lucide.Database size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Database Backup</h3>
                <p className="text-xs text-slate-500 mt-1">Export a snapshot of the current production database.</p>
              </div>
              <button onClick={() => handleSystemAction("Export Database Backup")} className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-lg hover:bg-indigo-100 w-full transition-colors">
                Download Backup
              </button>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                <Lucide.Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Clear System Cache</h3>
                <p className="text-xs text-slate-500 mt-1">Purge Redis/Memory cache to force data refetching.</p>
              </div>
              <button onClick={() => handleSystemAction("Clear System Cache")} className="px-4 py-2 bg-orange-50 text-orange-600 font-bold text-xs rounded-lg hover:bg-orange-100 w-full transition-colors">
                Clear Cache
              </button>
            </div>
            <div className="p-5 bg-white border border-rose-200 bg-rose-50/30 rounded-2xl shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Lucide.AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-rose-900">Maintenance Mode</h3>
                <p className="text-xs text-rose-700 mt-1">Lock down the platform. Only Admins can access.</p>
              </div>
              <button onClick={() => handleSystemAction("Toggle Maintenance Mode")} className={`px-4 py-2 font-bold text-xs rounded-lg w-full shadow-md transition-colors ${globalSettings.maintenance?.maintenanceMode ? 'bg-rose-700 text-white hover:bg-rose-800 shadow-rose-500/20' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20'}`}>
                {globalSettings.maintenance?.maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              </button>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Lucide.FileCode2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Seed Demo Data</h3>
                <p className="text-xs text-slate-500 mt-1">Generate mock users, restaurants, and orders.</p>
              </div>
              <button onClick={() => handleSystemAction("Seed Demo Data")} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 w-full transition-colors">
                Run Seed Script
              </button>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <Lucide.RefreshCcw size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Reset Settings</h3>
                <p className="text-xs text-slate-500 mt-1">Revert all platform configurations to default state.</p>
              </div>
              <button onClick={() => handleSystemAction("Reset To Default Settings")} className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 w-full transition-colors">
                Reset All Settings
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "about") {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-6">About System</h2>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
                O
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Online Food Delivery System</h3>
                <p className="text-xs font-bold text-brand-600">v2.4.0 (Production)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Build Number</span>
                <span className="font-mono font-bold text-slate-900">b-109483</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Environment</span>
                <span className="font-mono font-bold text-slate-900">Production</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Last Updated</span>
                <span className="font-mono font-bold text-slate-900">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">License</span>
                <span className="font-mono font-bold text-slate-900">Commercial (Active)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2 sm:col-span-2">
                <span className="text-slate-500">Developer</span>
                <span className="font-mono font-bold text-slate-900">Antigravity</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "systemHealth") {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-6">System Health & Live Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-600">Database Connection</h3>
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </div>
              <p className="text-2xl font-black text-slate-900">Connected</p>
              <p className="text-xs text-slate-500 font-mono mt-1">MongoDB Atlas cluster0</p>
            </div>
            
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-600">API Health</h3>
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </div>
              <p className="text-2xl font-black text-slate-900">Operational</p>
              <p className="text-xs text-slate-500 font-mono mt-1">Response time: ~42ms</p>
            </div>
            
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-600">Auth Service</h3>
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </div>
              <p className="text-2xl font-black text-slate-900">Stable</p>
              <p className="text-xs text-slate-500 font-mono mt-1">JWT Tokens active</p>
            </div>
          </div>
        </div>
      );
    }

    // Dynamic Generic Forms (General, Notifications, etc.)
    return (
      <form onSubmit={handleSaveSettings} className="space-y-6 animate-in fade-in duration-300">
        <h2 className="text-xl font-bold text-slate-900 mb-6 capitalize">{activeSection.replace(/([A-Z])/g, ' $1').trim()} Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(currentConfig).map(([key, val]) => {
            const label = key.replace(/([A-Z])/g, ' $1').trim();
            const isBoolean = typeof val === 'boolean';
            const isTextarea = typeof val === 'string' && val.length > 50;

            if (isBoolean) {
              return (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-sm font-bold text-slate-700 capitalize">{label}</span>
                  <button
                    type="button"
                    onClick={() => handleConfigChange(key, !val)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${val ? 'bg-brand-500' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${val ? 'translate-x-6' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              );
            }

            if (isTextarea) {
              return (
                <div key={key} className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2 capitalize">{label}</label>
                  <textarea
                    value={val}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 resize-none h-24"
                  />
                </div>
              );
            }

            return (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 capitalize">{label}</label>
                <input
                  type={typeof val === 'number' ? 'number' : 'text'}
                  value={val}
                  onChange={(e) => handleConfigChange(key, typeof val === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            );
          })}
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button type="submit" disabled={configSaving} className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 transition-colors">
            {configSaving ? "Saving Configuration..." : "Save Changes"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Settings Top Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm overflow-x-auto scrollbar-none">
        <nav className="flex items-center space-x-1 min-w-max">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-brand-50 text-brand-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={16} className={isActive ? "text-brand-500" : "text-slate-400"} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content Area */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[500px]">
        {renderContent()}
      </div>

    </div>
  );
}
