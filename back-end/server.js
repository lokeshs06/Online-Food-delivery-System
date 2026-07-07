const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://tryfoodie.netlify.app",
    
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Import routes
const authRoutes = require("./routes/auth");
const restaurantRoutes = require("./routes/restaurants");
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");
const reviewRoutes = require("./routes/reviews");
const adminRoutes = require("./routes/admin");
const categoryRoutes = require("./routes/categories");
const couponRoutes = require("./routes/coupons");
const offerRoutes = require("./routes/offers");
const stripeRoutes = require("./routes/stripe");
const settingsRoutes = require("./routes/settings");

// Global Maintenance Mode Middleware
app.use(async (req, res, next) => {
  // Always allow auth endpoints (login) and GET settings (for maintenance status)
  if (req.path.startsWith('/api/auth') || (req.path === '/api/settings' && req.method === 'GET')) {
    return next();
  }
  
  try {
    const getGlobalSettings = settingsRoutes.getGlobalSettings;
    if (getGlobalSettings) {
      const globalSettings = await getGlobalSettings();
      if (globalSettings?.maintenance?.maintenanceMode) {
        // Attempt to check if the user is an admin
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer')) {
          const token = authHeader.split(' ')[1];
          try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const User = require('./models/User');
            const user = await User.findById(decoded.id);
            if (user && user.role === 'admin') {
              return next(); // Admins bypass maintenance mode
            }
          } catch (e) {
            // Invalid token or user not found, fall through to block
          }
        }
        // Block all non-admin requests
        return res.status(503).json({ 
          success: false, 
          error: 'System is currently under maintenance. Please try again later.',
          maintenance: true 
        });
      }
    }
  } catch (err) {
    console.error('Maintenance mode check failed:', err);
  }
  next();
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/settings", settingsRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Online Food Delivery System API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || "Server Error",
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ofds";

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log(`Connected to MongoDB database successfully!`);
    console.log(`📍 Database: ${new URL(MONGODB_URI).pathname}`);
    app.listen(PORT, () => {
      console.log(
        `Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
      );
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
