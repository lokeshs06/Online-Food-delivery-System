import React, { useState, useEffect } from "react";
import * as Lucide from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Footer from '../components/Footer';

export default function Register() {
  const { register, user, globalSettings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const redirectMessage = location.state?.message;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("customer");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      let dest = "/user/restaurants";
      if (user.role === "restaurant_owner") {
        dest = "/owner/dashboard";
      } else if (user.role === "admin") {
        dest = "/admin/dashboard";
      }

      navigate(from && from !== "/" ? from : dest, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    const res = await register(name, email, password, role);
    if (!res.success) {
      setAuthError(res.error);
    }
    setLoading(false);
  }
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-block font-black text-3xl tracking-tight text-[#1A1A1A] hover:text-brand-500 transition-colors mb-2"
            >
              Foodie
            </Link>
            <h3 className="text-2xl font-black text-slate-900 mb-1.5">
              Create an Account
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Join Foodie for express delivery
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center space-x-2">
              <Lucide.AlertTriangle size={16} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {redirectMessage && !authError && (
            <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center space-x-2">
              <Lucide.Info size={16} className="shrink-0" />
              <span>{redirectMessage}</span>
            </div>
          )}

          {/* Registration Blocked Message */}
          {!globalSettings?.customerSettings?.allowRegistration ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lucide.ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">Registration Disabled</h3>
              <p className="text-sm font-medium text-slate-500 mb-8 max-w-sm mx-auto">
                New registrations are currently disabled. Please contact the administrator for assistance.
              </p>
              <Link to="/login" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all pr-12 font-medium placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? (
                      <Lucide.EyeOff size={18} />
                    ) : (
                      <Lucide.Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  I am a...
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold text-center transition-colors ${
                      role === "customer"
                        ? "bg-brand-50 border-brand-500 text-brand-600"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("restaurant_owner")}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold text-center transition-colors ${
                      role === "restaurant_owner"
                        ? "bg-brand-50 border-brand-500 text-brand-600"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Owner
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg hover:shadow-brand-500/25 transition-all disabled:opacity-50 mt-6"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-500 hover:text-brand-500 transition-colors"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}