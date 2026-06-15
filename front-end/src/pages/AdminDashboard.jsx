import React, { useState, useEffect } from "react";
import * as Lucide from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import AdminOffersTab from "../components/AdminOffersTab";

export default function AdminDashboard() {
  const { user, token, addNotification, API_BASE_URL } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Sync tab with URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/users")) setActiveTab("users");
    else if (path.includes("/admin/restaurants")) setActiveTab("restaurants");
    else if (path.includes("/admin/orders")) setActiveTab("orders");
    else if (path.includes("/admin/categories")) setActiveTab("categories");
    else if (path.includes("/admin/coupons")) setActiveTab("coupons");
    else if (path.includes("/admin/offers")) setActiveTab("offers");
    else setActiveTab("overview");
  }, [location.pathname]);

  const [loading, setLoading] = useState(true);

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catActive, setCatActive] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);

  // Coupon Modal State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [coupCode, setCoupCode] = useState("");
  const [coupDiscountType, setCoupDiscountType] = useState("percentage");
  const [coupDiscountAmount, setCoupDiscountAmount] = useState("");
  const [coupExpiry, setCoupExpiry] = useState("");
  const [coupUsageLimit, setCoupUsageLimit] = useState("");
  const [coupActive, setCoupActive] = useState(true);
  const [savingCoupon, setSavingCoupon] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        resAnalytics,
        resRestaurants,
        resUsers,
        resOrders,
        resCategories,
        resCoupons,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/analytics`, { headers }),
        fetch(`${API_BASE_URL}/admin/restaurants`, { headers }),
        fetch(`${API_BASE_URL}/admin/users`, { headers }),
        fetch(`${API_BASE_URL}/admin/orders`, { headers }),
        fetch(`${API_BASE_URL}/categories/admin`, { headers }),
        fetch(`${API_BASE_URL}/coupons`, { headers }),
      ]);

      const dataAnalytics = await resAnalytics.json();
      const dataRestaurants = await resRestaurants.json();
      const dataUsers = await resUsers.json();
      const dataOrders = await resOrders.json();
      const dataCategories = await resCategories.json();
      const dataCoupons = await resCoupons.json();

      if (dataAnalytics.success) setAnalytics(dataAnalytics.data);
      if (dataRestaurants.success) setRestaurants(dataRestaurants.data);
      if (dataUsers.success) setUsers(dataUsers.data);
      if (dataOrders.success) setOrders(dataOrders.data);
      if (dataCategories.success) setCategories(dataCategories.data);
      if (dataCoupons.success) setCoupons(dataCoupons.data);
    } catch (err) {
      addNotification("Failed to fetch admin data.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const toggleRestaurantApproval = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/restaurants/${id}/toggle-approval`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        addNotification("Restaurant approval updated", "success");
        setRestaurants(restaurants.map((r) => (r._id === id ? data.data : r)));
      } else {
        addNotification(data.error, "error");
      }
    } catch (err) {
      addNotification("Failed to update approval", "error");
    }
  };

  const toggleRestaurantActive = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/restaurants/${id}/toggle-active`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        addNotification("Restaurant active status updated", "success");
        setRestaurants(restaurants.map((r) => (r._id === id ? data.data : r)));
      } else {
        addNotification(data.error, "error");
      }
    } catch (err) {
      addNotification("Failed to update status", "error");
    }
  };

  const toggleUserBlock = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/users/${id}/toggle-block`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        addNotification("User block status updated", "success");
        setUsers(users.map((u) => (u._id === id ? data.data : u)));
      } else {
        addNotification(data.error, "error");
      }
    } catch (err) {
      addNotification("Failed to update user", "error");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        addNotification("User deleted", "success");
        setUsers(users.filter((u) => u._id !== id));
      } else {
        addNotification(data.error, "error");
      }
    } catch (err) {
      addNotification("Failed to delete user", "error");
    }
  };

  // --- Category Actions ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setSavingCategory(true);
    try {
      const payload = {
        name: catName,
        imageUrl: catImage,
        isActive: catActive,
      };
      let res;
      if (editingCategory) {
        res = await fetch(
          `${API_BASE_URL}/categories/${editingCategory._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );
      } else {
        res = await fetch(`${API_BASE_URL}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (data.success) {
        addNotification(
          editingCategory ? "Category updated" : "Category created",
          "success",
        );
        if (editingCategory) {
          setCategories(
            categories.map((c) =>
              c._id === editingCategory._id ? data.data : c,
            ),
          );
        } else {
          setCategories([...categories, data.data]);
        }
        setShowCategoryModal(false);
      } else {
        addNotification(data.error, "error");
      }
    } catch (err) {
      addNotification("Failed to save category", "error");
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        addNotification("Category deleted", "success");
        setCategories(categories.filter((c) => c._id !== id));
      } else {
        addNotification(data.error, "error");
      }
    } catch (err) {
      addNotification("Failed to delete category", "error");
    }
  };

  const toggleCategoryActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        addNotification("Category status updated", "success");
        setCategories(categories.map((c) => (c._id === id ? data.data : c)));
      } else {
        addNotification(data.error, "error");
      }
    } catch (err) {
      addNotification("Failed to update category status", "error");
    }
  };

  // --- Coupon Actions ---
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setSavingCoupon(true);
    try {
      const payload = {
        code: coupCode,
        discountType: coupDiscountType,
        discountAmount: parseFloat(coupDiscountAmount),
        expiryDate: coupExpiry ? new Date(coupExpiry).toISOString() : null,
        usageLimit: coupUsageLimit ? parseInt(coupUsageLimit) : null,
        isActive: coupActive,
      };

      let res;
      if (editingCoupon) {
        res = await fetch(
          `${API_BASE_URL}/coupons/${editingCoupon._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );
      } else {
        res = await fetch(`${API_BASE_URL}/coupons`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (data.success) {
        addNotification(
          editingCoupon ? "Coupon updated" : "Coupon created",
          "success",
        );
        if (editingCoupon) {
          setCoupons(
            coupons.map((c) => (c._id === editingCoupon._id ? data.data : c)),
          );
        } else {
          setCoupons([...coupons, data.data]);
        }
        setShowCouponModal(false);
      } else {
        addNotification(data.error, "error");
      }
    } catch (err) {
      addNotification("Failed to save coupon", "error");
    } finally {
      setSavingCoupon(false);
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        addNotification("Coupon deleted", "success");
        setCoupons(coupons.filter((c) => c._id !== id));
      } else {
        addNotification(data.error, "error");
      }
    } catch (err) {
      addNotification("Failed to delete coupon", "error");
    }
  };

  const toggleCouponActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        addNotification("Coupon status updated", "success");
        setCoupons(coupons.map((c) => (c._id === id ? data.data : c)));
      } else {
        addNotification(data.error, "error");
      }
    } catch (err) {
      addNotification("Failed to update coupon status", "error");
    }
  };

  // Renderers
  const renderSidebar = () => {
    const tabs = [
      { id: "overview", label: "Overview", icon: Lucide.LayoutDashboard },
      { id: "restaurants", label: "Restaurants", icon: Lucide.Store },
      { id: "users", label: "Users", icon: Lucide.Users },
      { id: "orders", label: "Orders", icon: Lucide.ShoppingBag },
      { id: "categories", label: "Categories", icon: Lucide.Tag },
      { id: "coupons", label: "Coupons", icon: Lucide.Ticket },
      { id: "offers", label: "Offers", icon: Lucide.Tags },
    ];

    return (
      <div className="w-64 shrink-0 pr-8 hidden lg:block">
        <div className="sticky top-28">
          <div className="mb-6 px-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Admin Panel
            </h2>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-brand-50 text-brand-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-brand-500" : "text-slate-400"}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    if (!analytics) return null;
    const cards = [
      {
        title: "Total Revenue",
        value: `$${analytics.totalRevenue.toFixed(2)}`,
        icon: Lucide.DollarSign,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
      },
      {
        title: "Monthly Revenue",
        value: `$${analytics.monthlyRevenue.toFixed(2)}`,
        icon: Lucide.TrendingUp,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
      },
      {
        title: "Total Orders",
        value: analytics.totalOrders,
        icon: Lucide.ShoppingBag,
        color: "text-blue-500",
        bg: "bg-blue-50",
      },
      {
        title: "Completed Orders",
        value: analytics.completedOrders,
        icon: Lucide.CheckCircle,
        color: "text-brand-500",
        bg: "bg-brand-50",
      },
      {
        title: "Total Customers",
        value: analytics.totalCustomers,
        icon: Lucide.Users,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
      },
      {
        title: "Pending Approvals",
        value: analytics.pendingRestaurants,
        icon: Lucide.Store,
        color: "text-amber-500",
        bg: "bg-amber-50",
      },
    ];

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Platform Analytics
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"
              >
                <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRestaurants = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Restaurant Management
        </h1>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Approval</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {restaurants.map((rest) => (
                <tr
                  key={rest._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={rest.imageUrl}
                        alt={rest.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                      />
                      <div>
                        <p className="font-bold text-sm text-slate-900">
                          {rest.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {rest.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {rest.owner?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${rest.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}
                    >
                      {rest.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${rest.isApproved ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}
                    >
                      {rest.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => toggleRestaurantApproval(rest._id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {rest.isApproved ? "Revoke" : "Approve"}
                    </button>
                    <button
                      onClick={() => toggleRestaurantActive(rest._id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {rest.isActive ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {restaurants.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">
              No restaurants found.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${u.isBlocked ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}
                    >
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {u.role !== "admin" && (
                      <>
                        <button
                          onClick={() => toggleUserBlock(u._id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    const statusStyle = (status) => {
      switch (status) {
        case "pending":
          return "bg-yellow-50 text-yellow-600 border-yellow-200";
        case "accepted":
          return "bg-blue-50 text-blue-600 border-blue-200";
        case "preparing":
          return "bg-orange-50 text-orange-600 border-orange-200";
        case "ready":
          return "bg-purple-50 text-purple-600 border-purple-200";
        case "out-for-delivery":
          return "bg-indigo-50 text-indigo-600 border-indigo-200";
        case "delivered":
          return "bg-emerald-50 text-emerald-600 border-emerald-200";
        case "cancelled":
          return "bg-rose-50 text-rose-600 border-rose-200";
        default:
          return "bg-slate-100 text-slate-600 border-slate-200";
      }
    };

    const cancelledCount = orders.filter(
      (o) => o.status === "cancelled",
    ).length;
    const deliveredCount = orders.filter(
      (o) => o.status === "delivered",
    ).length;
    const activeCount = orders.filter(
      (o) => !["delivered", "cancelled"].includes(o.status),
    ).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Platform Orders</h1>
          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              {activeCount} Active
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              {deliveredCount} Delivered
            </span>
            <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
              {cancelledCount} Cancelled
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className={`transition-colors ${order.status === "cancelled" ? "bg-rose-50/30" : "hover:bg-slate-50"}`}
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {order.customer?.name || "Guest"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.customer?.email}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {order.restaurant?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 uppercase">
                    {order.paymentMethod}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`whitespace-nowrap px-2 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${statusStyle(order.status)}`}
                    >
                      {order.status.replace(/-/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">
              No orders found.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCategories = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <button
            onClick={() => {
              setEditingCategory(null);
              setCatName("");
              setCatImage("");
              setCatActive(true);
              setShowCategoryModal(true);
            }}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-colors flex items-center space-x-2"
          >
            <Lucide.Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={c.imageUrl || "https://via.placeholder.com/40"}
                      alt={c.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-slate-900">
                    {c.name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${c.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}
                    >
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => toggleCategoryActive(c._id, c.isActive)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(c);
                        setCatName(c.name);
                        setCatImage(c.imageUrl || "");
                        setCatActive(c.isActive);
                        setShowCategoryModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(c._id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">
              No categories found.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCoupons = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
          <button
            onClick={() => {
              setEditingCoupon(null);
              setCoupCode("");
              setCoupDiscountType("percentage");
              setCoupDiscountAmount("");
              setCoupExpiry("");
              setCoupUsageLimit("");
              setCoupActive(true);
              setShowCouponModal(true);
            }}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-colors flex items-center space-x-2"
          >
            <Lucide.Plus size={16} />
            <span>Create Coupon</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Limits & Expiry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md border border-brand-200">
                      {c.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-slate-900">
                    {c.discountType === "percentage"
                      ? `${c.discountAmount}%`
                      : `$${c.discountAmount.toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-500">
                      <div>
                        Used: {c.timesUsed} / {c.usageLimit || "∞"}
                      </div>
                      {c.expiryDate && (
                        <div>
                          Expires: {new Date(c.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${c.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}
                    >
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => toggleCouponActive(c._id, c.isActive)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCoupon(c);
                        setCoupCode(c.code);
                        setCoupDiscountType(c.discountType);
                        setCoupDiscountAmount(c.discountAmount);
                        setCoupExpiry(
                          c.expiryDate
                            ? new Date(c.expiryDate).toISOString().split("T")[0]
                            : "",
                        );
                        setCoupUsageLimit(c.usageLimit || "");
                        setCoupActive(c.isActive);
                        setShowCouponModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCoupon(c._id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">
              No coupons found.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-start">
      {renderSidebar()}
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400">
            <Lucide.Loader2 size={32} className="animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "overview" && renderOverview()}
            {activeTab === "restaurants" && renderRestaurants()}
            {activeTab === "users" && renderUsers()}
            {activeTab === "orders" && renderOrders()}
            {activeTab === "categories" && renderCategories()}
            {activeTab === "coupons" && renderCoupons()}
            {activeTab === "offers" && <AdminOffersTab />}
          </>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <Lucide.X size={16} />
            </button>
            <h3 className="text-lg font-black text-[#1A1A1A] mb-4">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
            <form
              onSubmit={handleCategorySubmit}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Image URL
                </label>
                <input
                  type="text"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={catActive}
                  onChange={(e) => setCatActive(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-0"
                />
                <label
                  htmlFor="catActive"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Category is Active
                </label>
              </div>
              <button
                type="submit"
                disabled={savingCategory}
                className="w-full py-3 mt-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg disabled:opacity-50 transition-colors"
              >
                {savingCategory ? "Saving..." : "Save Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCouponModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <Lucide.X size={16} />
            </button>
            <h3 className="text-lg font-black text-[#1A1A1A] mb-4">
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </h3>
            <form onSubmit={handleCouponSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    value={coupCode}
                    onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={coupDiscountType}
                    onChange={(e) => setCoupDiscountType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={coupDiscountAmount}
                    onChange={(e) => setCoupDiscountAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={coupExpiry}
                    onChange={(e) => setCoupExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    value={coupUsageLimit}
                    onChange={(e) => setCoupUsageLimit(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="coupActive"
                  checked={coupActive}
                  onChange={(e) => setCoupActive(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-0"
                />
                <label
                  htmlFor="coupActive"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Coupon is Active
                </label>
              </div>
              <button
                type="submit"
                disabled={savingCoupon}
                className="w-full py-3 mt-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg disabled:opacity-50 transition-colors"
              >
                {savingCoupon ? "Saving..." : "Save Coupon"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
