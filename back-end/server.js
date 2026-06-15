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
