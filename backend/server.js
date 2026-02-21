import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import userRoutes from "./routes/user.routes.js";
import fabricRoutes from "./routes/fabric.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import itemRoutes from "./routes/item.routes.js";

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

// 👥 USER ROUTES - Protected
app.use("/api/users", userRoutes);

// 👕 FABRIC ROUTES - Protected
app.use("/api/fabrics", fabricRoutes);

// 📁 CATEGORY ROUTES - Protected
app.use("/api/categories", categoryRoutes);

// 🧵 ITEM ROUTES - Protected
app.use("/api/items", itemRoutes);

// ==================== 404 HANDLER ====================
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
  
  // Public Routes
  console.log(`\n🔓 PUBLIC ROUTES:`);
  console.log(`   GET  /`);
  console.log(`   POST /api/auth/login`);
  
  // Customer Routes
  console.log(`\n👤 CUSTOMER ROUTES:`);
  console.log(`   🔒 GET  /api/customers/all`);
  console.log(`   🔒 POST /api/customers/create`);
  console.log(`   🔒 GET  /api/customers/search/phone/:phone`);
  console.log(`   🔒 GET  /api/customers/search/id/:customerId`);
  console.log(`   🔒 GET  /api/customers/:id`);
  console.log(`   🔒 PUT  /api/customers/:id`);
  console.log(`   🔒 DEL  /api/customers/:id`);
  console.log(`   🔒 GET  /api/customers/stats`);
  
  // User Routes
  console.log(`\n👥 USER ROUTES:`);
  console.log(`   🔒 GET  /api/users/profile`);
  console.log(`   🔒 PUT  /api/users/profile`);
  console.log(`   🔒 PUT  /api/users/change-password`);
  console.log(`   👑 GET  /api/users/all-staff`);
  console.log(`   👑 POST /api/users/create`);
  console.log(`   👑 GET  /api/users/:id`);
  console.log(`   👑 PUT  /api/users/:id`);
  console.log(`   👑 DEL  /api/users/:id`);
  console.log(`   👑 PUT  /api/users/:id/toggle-status`);
  
  // Fabric Routes
  console.log(`\n👕 FABRIC ROUTES:`);
  console.log(`   🔒 POST /api/fabrics        - Create fabric (with image)`);
  console.log(`   🔒 GET  /api/fabrics        - Get all fabrics`);
  console.log(`   🔒 GET  /api/fabrics/:id    - Get fabric by ID`);
  console.log(`   🔒 PUT  /api/fabrics/:id    - Update fabric (with image)`);
  console.log(`   🔒 DEL  /api/fabrics/:id    - Delete fabric`);
  console.log(`   🔒 PATCH /api/fabrics/:id/toggle - Toggle fabric status`);
  
  // Category Routes
  console.log(`\n📁 CATEGORY ROUTES:`);
  console.log(`   🔒 POST /api/categories     - Create category`);
  console.log(`   🔒 GET  /api/categories     - Get all categories`);
  console.log(`   🔒 GET  /api/categories/:id - Get category by ID`);
  console.log(`   🔒 PUT  /api/categories/:id - Update category`);
  console.log(`   🔒 DEL  /api/categories/:id - Delete category`);
  console.log(`   🔒 PATCH /api/categories/:id/toggle - Toggle category status`);
  
  // Item Routes
  console.log(`\n🧵 ITEM ROUTES:`);
  console.log(`   🔒 POST /api/items          - Create item`);
  console.log(`   🔒 GET  /api/items          - Get all items (filter by ?categoryId=)`);
  console.log(`   🔒 GET  /api/items/:id      - Get item by ID`);
  console.log(`   🔒 PUT  /api/items/:id      - Update item`);
  console.log(`   🔒 DEL  /api/items/:id      - Delete item`);
  console.log(`   🔒 PATCH /api/items/:id/toggle - Toggle item status`);
  
  console.log(`\n✅ Total Routes: 28 endpoints\n`);
});