import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import userRoutes from "./routes/user.routes.js";

// Load env variables
dotenv.config();

// Create app
const app = express();

// Connect MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Body parser
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);

// Test route
app.get("/", (req, res) => {
  res.send("Dreamfit API Running 🚀");
});

// ==================== ROUTES ====================

// 🔐 AUTH ROUTES - Public
app.use("/api/auth", authRoutes);

// 👤 CUSTOMER ROUTES - Protected
app.use("/api/customers", customerRoutes);

// 👥 USER ROUTES - Protected (Profile & Admin)
app.use("/api/users", userRoutes);

// ==================== 404 HANDLER ====================
// ✅ FIXED: Remove the "*" parameter
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl 
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`\n✅ Available Routes:`);
  console.log(`   🔓 GET  /`);
  console.log(`   🔓 POST /api/auth/login`);
  console.log(`   🔒 GET  /api/customers/all`);
  console.log(`   🔒 POST /api/customers/create`);
  console.log(`   🔒 GET  /api/customers/search/:phone`);
  console.log(`   🔒 GET  /api/customers/:id`);
  console.log(`   🔒 PUT  /api/customers/:id`);
  console.log(`   🔒 DEL  /api/customers/:id`);
  console.log(`   🔒 GET  /api/users/profile`);
  console.log(`   🔒 PUT  /api/users/profile`);
  console.log(`   🔒 PUT  /api/users/change-password`);
  console.log(`   👑 GET  /api/users/all-staff`);
  console.log(`   👑 POST /api/users/create`);
  console.log(`   👑 GET  /api/users/:id`);
  console.log(`   👑 PUT  /api/users/:id`);
  console.log(`   👑 DEL  /api/users/:id`);
  console.log(`   👑 PUT  /api/users/:id/toggle-status\n`);
});