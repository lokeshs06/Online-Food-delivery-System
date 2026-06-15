import React, { createContext, useState, useEffect, useContext } from "react";

const AppContext = createContext();

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const AppProvider = ({ children }) => {
  // Navigation
  const [targetSection, setTargetSection] = useState(null); // For anchor scrolling on Home
  const [profileActiveTab, setProfileActiveTab] = useState("orders"); // orders, profile, password, addresses, favorites
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [scrollToMenu, setScrollToMenu] = useState(false); // When true, RestaurantDetail scrolls to menu
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("ofds_token") || null,
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [favoriteFoods, setFavoriteFoods] = useState([]);

  // Cart State
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("ofds_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Notifications (Toasts)
  const [notifications, setNotifications] = useState([]);

  // Load User Profile on startup
  const checkAuth = async () => {
    if (!token) {
      setAuthLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setFavorites(data.user.favorites || []);
        setFavoriteFoods(data.user.favoriteItems || []);
        if (data.user.role === "restaurant_owner") {
          // let the routing handle it
        }
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem("ofds_cart", JSON.stringify(cart));
  }, [cart]);

  // Notification Toast Helper
  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Login
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("ofds_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setFavorites(data.user.favorites || []);
        setFavoriteFoods(data.user.favoriteItems || []);
        addNotification(`Welcome back, ${data.user.name}!`, "success");
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: "Server connection failed" };
    }
  };

  // Register
  const register = async (name, email, password, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("ofds_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setFavorites(data.user.favorites || []);
        setFavoriteFoods(data.user.favoriteItems || []);
        addNotification(
          `Account created! Welcome, ${data.user.name}!`,
          "success",
        );
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: "Server connection failed" };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("ofds_token");
    setToken(null);
    setUser(null);
    setFavorites([]);
    setFavoriteFoods([]);
    setCart([]);
    addNotification("Logged out successfully", "info");
  };

  // Cart Operations
  const addToCart = (restaurantId, item, quantity, customizations) => {
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
      addNotification(
        "Cleared cart from previous restaurant to add new items",
        "warning",
      );
      setCart([{ restaurantId, item, quantity, customizations }]);
      return;
    }

    const existingIndex = cart.findIndex(
      (c) =>
        c.item._id === item._id &&
        JSON.stringify(c.customizations) === JSON.stringify(customizations),
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, { restaurantId, item, quantity, customizations }]);
    }
    addNotification(`${item.name} added to cart!`, "success");
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const updateCartQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    const newCart = [...cart];
    newCart[index].quantity = quantity;
    setCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
  };

  // Favorites Operations
  const toggleFavorite = async (restaurantId) => {
    if (!user) {
      addNotification("Please log in to save favorites!", "warning");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/favorites/${restaurantId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      if (data.success) {
        setFavorites(data.favorites);
        addNotification("Favorites updated", "success");
      } else {
        addNotification(data.error || "Failed to update favorites", "error");
      }
    } catch (err) {
      addNotification("Connection error", "error");
    }
  };

  const toggleFavoriteFood = async (itemId) => {
    if (!user) {
      addNotification("Please login to save favorite foods", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/favorite-items/${itemId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const isAdded = data.favoriteItems.includes(itemId);
        checkAuth();
        addNotification(
          isAdded ? "Food added to favorites" : "Food removed from favorites",
          "success",
        );
      } else {
        addNotification(
          data.error || "Failed to update favorite foods",
          "error",
        );
      }
    } catch (err) {
      addNotification("Connection error", "error");
    }
  };

  // Helper properties
  const cartSubtotal = cart.reduce((sum, c) => {
    const itemPrice = c.item.price;
    const extraPrice = (c.customizations?.extras?.length || 0) * 1.5;
    return sum + (itemPrice + extraPrice) * c.quantity;
  }, 0);

  const cartItemsCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        API_BASE_URL,
        targetSection,
        setTargetSection,
        profileActiveTab,
        setProfileActiveTab,
        selectedRestaurantId,
        setSelectedRestaurantId,
        scrollToMenu,
        setScrollToMenu,
        trackingOrderId,
        setTrackingOrderId,
        user,
        setUser,
        token,
        authLoading,
        cart,
        favorites,
        favoriteFoods,
        notifications,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleFavorite,
        toggleFavoriteFood,
        addNotification,
        cartSubtotal,
        cartItemsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
