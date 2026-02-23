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
import sizeTemplateRoutes from "./routes/sizeTemplate.routes.js";
import sizeFieldRoutes from "./routes/sizeField.routes.js";

// ✅ NEW ORDER MANAGEMENT ROUTES
import orderRoutes from "./routes/order.routes.js";
import garmentRoutes from "./routes/garment.routes.js";
import workRoutes from "./routes/work.routes.js";

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

// 📏 SIZE TEMPLATE ROUTES - Protected
app.use("/api/size-templates", sizeTemplateRoutes);

// 📐 SIZE FIELD ROUTES - Protected
app.use("/api/size-fields", sizeFieldRoutes);

// 📦 ORDER MANAGEMENT ROUTES - Protected
app.use("/api/orders", orderRoutes);
app.use("/api/garments", garmentRoutes);
app.use("/api/works", workRoutes);

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
  
  // Size Template Routes
  console.log(`\n📏 SIZE TEMPLATE ROUTES:`);
  console.log(`   🔒 POST /api/size-templates        - Create template`);
  console.log(`   🔒 GET  /api/size-templates        - Get all templates (with pagination)`);
  console.log(`   🔒 GET  /api/size-templates/:id    - Get template by ID`);
  console.log(`   🔒 PUT  /api/size-templates/:id    - Update template`);
  console.log(`   🔒 DEL  /api/size-templates/:id    - Delete template`);
  console.log(`   🔒 PATCH /api/size-templates/:id/toggle - Toggle template status`);
  
  // Size Field Routes
  console.log(`\n📐 SIZE FIELD ROUTES:`);
  console.log(`   🔒 GET  /api/size-fields           - Get all size fields`);
  console.log(`   👑 POST /api/size-fields           - Create size field (Admin only)`);
  
  // ✅ NEW ORDER MANAGEMENT ROUTES
  console.log(`\n📦 ORDER MANAGEMENT ROUTES:`);
  console.log(`\n   🔥 ORDER ROUTES:`);
  console.log(`   🔒 POST /api/orders              - Create new order`);
  console.log(`   🔒 GET  /api/orders              - Get all orders (with filters)`);
  console.log(`   🔒 GET  /api/orders/:id          - Get order by ID`);
  console.log(`   🔒 PATCH /api/orders/:id/status  - Update order status`);
  console.log(`   🔒 DEL  /api/orders/:id          - Delete order`);
  
  console.log(`\n   🧵 GARMENT ROUTES:`);
  console.log(`   🔒 POST /api/garments/order/:orderId - Create garment (with images)`);
  console.log(`   🔒 GET  /api/garments/order/:orderId - Get garments by order`);
  console.log(`   🔒 GET  /api/garments/:id         - Get garment by ID`);
  console.log(`   🔒 PUT  /api/garments/:id         - Update garment`);
  console.log(`   🔒 DEL  /api/garments/:id         - Delete garment`);
  
  console.log(`\n   ⚙️ WORK ROUTES:`);
  console.log(`   🔒 POST /api/works                - Create work assignment`);
  console.log(`   🔒 GET  /api/works                - Get all works`);
  console.log(`   🔒 GET  /api/works/user/:userId   - Get works by user (Cutting Master)`);
  console.log(`   🔒 GET  /api/works/:id            - Get work by ID`);
  console.log(`   🔒 PATCH /api/works/:id/status    - Update work status`);
  console.log(`   🔒 DEL  /api/works/:id            - Delete work`);
  
  console.log(`\n✅ Total Routes: 45+ endpoints\n`);
});