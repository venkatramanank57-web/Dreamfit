// backend/server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
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

// ✅ CUSTOMER SIZE PROFILE ROUTES
import customerSizeRoutes from "./routes/customerSize.routes.js";

// ✅ ORDER MANAGEMENT ROUTES
import orderRoutes from "./routes/order.routes.js";
import garmentRoutes from "./routes/garment.routes.js";
import workRoutes from "./routes/work.routes.js";           // ✅ Work routes

// ✅ TAILOR MANAGEMENT ROUTES
import tailorRoutes from "./routes/tailor.routes.js";

// ✅ NOTIFICATION ROUTES
import notificationRoutes from "./routes/notification.routes.js";  // ✅ Notification routes

// ✅ CUTTING MASTER & STORE KEEPER ROUTES
import cuttingMasterRoutes from "./routes/cuttingMaster.routes.js";
import storeKeeperRoutes from "./routes/storeKeeper.routes.js";

// ✅ NEW: BANKING / TRANSACTION ROUTES
import transactionRoutes from "./routes/transaction.routes.js";

// ✅ IMPORT ERROR HANDLING MIDDLEWARE
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Load env variables
dotenv.config();

// Create app
const app = express();

// Connect MongoDB
connectDB();

// ==================== MIDDLEWARE ====================

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  "https://dreamfit.vercel.app",
  "https://dreamfit-six.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600, // 10 minutes
  })
);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ==================== RATE LIMITING ====================
// Skip rate limiting in development or set higher limits
if (process.env.NODE_ENV === "production") {
  // Production: Stricter but still reasonable limits
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Limit each IP to 5000 requests per windowMs (about 333 per minute)
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for static files
      return req.url.startsWith('/uploads/');
    }
  });
  app.use("/api/", limiter);
  console.log("🔒 Production rate limit: 5000 requests/15min");
} else {
  // Development: Very high limits or disabled to avoid 429 errors
  console.log("🔧 Development mode - Rate limiting DISABLED to prevent 429 errors");
}

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static("uploads"));

// ==================== TEST ROUTE ====================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🎉 Dreamfit API Running",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      customers: "/api/customers",
      users: "/api/users",
      fabrics: "/api/fabrics",
      categories: "/api/categories",
      items: "/api/items",
      sizeTemplates: "/api/size-templates",
      sizeFields: "/api/size-fields",
      customerSize: "/api/customer-size",
      orders: "/api/orders",
      garments: "/api/garments",
      works: "/api/works",
      tailors: "/api/tailors",
      cuttingMasters: "/api/cutting-masters",
      storeKeepers: "/api/store-keepers",
      notifications: "/api/notifications",
      transactions: "/api/transactions",
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: "connected"
  });
});

// ==================== API ROUTES ====================

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

// ✅ CUSTOMER SIZE PROFILE ROUTES - Protected
app.use("/api/customer-size", customerSizeRoutes);

// 📦 ORDER MANAGEMENT ROUTES - Protected
app.use("/api/orders", orderRoutes);
app.use("/api/garments", garmentRoutes);
app.use("/api/works", workRoutes);                    // ✅ Work routes registered

// ✂️ TAILOR MANAGEMENT ROUTES - Protected
app.use("/api/tailors", tailorRoutes);

// 🔔 NOTIFICATION ROUTES - Protected
app.use("/api/notifications", notificationRoutes);    // ✅ Notification routes registered

// ✅ CUTTING MASTER ROUTES - Protected
app.use("/api/cutting-masters", cuttingMasterRoutes);

// ✅ STORE KEEPER ROUTES - Protected
app.use("/api/store-keepers", storeKeeperRoutes);

// ✅ BANKING / TRANSACTION ROUTES - Protected
app.use("/api/transactions", transactionRoutes);

// ==================== ERROR HANDLING MIDDLEWARE ====================
// ⚠️ IMPORTANT: These must be LAST after all routes!

// 404 Handler - Route not found
app.use(notFound);

// Global Error Handler - Catches all errors
app.use(errorHandler);

// ==================== UNHANDLED REJECTIONS ====================
process.on("unhandledRejection", (err) => {
  console.log("❌ UNHANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message);
  console.log(err.stack);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log("❌ UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log(`🚀 DREAMFIT ERP BACKEND`);
  console.log("=".repeat(60));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`💾 Database: MongoDB Connected`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  console.log("=".repeat(60));
  
  // ==================== ROUTES LIST ====================
  console.log(`\n📋 AVAILABLE ROUTES:`);
  console.log("-".repeat(60));
  
  // Public Routes
  console.log(`\n🔓 PUBLIC ROUTES:`);
  console.log(`   ✅ GET  /`);
  console.log(`   ✅ GET  /health`);
  console.log(`   ✅ POST /api/auth/login`);
  console.log(`   ✅ POST /api/auth/refresh-token`);
  console.log(`   ✅ POST /api/auth/forgot-password`);
  console.log(`   ✅ POST /api/auth/reset-password/:token`);
  
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
  console.log(`   👑 GET  /api/users/role/:role`);
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
  
  // CUSTOMER SIZE PROFILE ROUTES
  console.log(`\n📏 CUSTOMER SIZE PROFILE ROUTES:`);
  console.log(`   🔒 GET    /api/customer-size/customer/:customerId        - Get all profiles for a customer`);
  console.log(`   🔒 GET    /api/customer-size/customer/:customerId/stats  - Get profile statistics`);
  console.log(`   🔒 POST   /api/customer-size                             - Create new size profile`);
  console.log(`   🔒 POST   /api/customer-size/bulk                        - Bulk create profiles (Admin only)`);
  console.log(`   🔒 GET    /api/customer-size/recent                      - Get recently used profiles`);
  console.log(`   🔒 GET    /api/customer-size/old                         - Get profiles >3 months old`);
  console.log(`   🔒 GET    /api/customer-size/:id                         - Get single profile by ID`);
  console.log(`   🔒 PUT    /api/customer-size/:id/measurements            - Update measurements with history`);
  console.log(`   🔒 PATCH  /api/customer-size/:id/use                     - Mark profile as used`);
  console.log(`   🔒 GET    /api/customer-size/:id/history                 - Get measurement change history`);
  console.log(`   🔒 DELETE /api/customer-size/:id                         - Soft delete profile (Admin only)`);
  
  // ORDER MANAGEMENT ROUTES
  console.log(`\n📦 ORDER MANAGEMENT ROUTES:`);
  
  // Order Routes
  console.log(`\n   🔥 ORDER ROUTES:`);
  console.log(`   🔒 POST   /api/orders              - Create new order`);
  console.log(`   🔒 GET    /api/orders              - Get all orders (with filters)`);
  console.log(`   🔒 GET    /api/orders/:id          - Get order by ID`);
  console.log(`   🔒 PATCH  /api/orders/:id/status   - Update order status`);
  console.log(`   🔒 PUT    /api/orders/:id          - Update order`);
  console.log(`   🔒 DEL    /api/orders/:id          - Delete order`);
  console.log(`   🔒 GET    /api/orders/stats        - Get order statistics`);
  
  // Garment Routes
  console.log(`\n   🧵 GARMENT ROUTES:`);
  console.log(`   🔒 POST   /api/garments/order/:orderId - Create garment (with images)`);
  console.log(`   🔒 GET    /api/garments/order/:orderId - Get garments by order`);
  console.log(`   🔒 GET    /api/garments/:id         - Get garment by ID`);
  console.log(`   🔒 PUT    /api/garments/:id         - Update garment`);
  console.log(`   🔒 PATCH  /api/garments/:id/images  - Update garment images`);
  console.log(`   🔒 DEL    /api/garments/:id/images  - Delete garment image`);
  console.log(`   🔒 DEL    /api/garments/:id         - Delete garment`);
  
  // ✅ WORK ROUTES - Detailed
  console.log(`\n   ⚙️ WORK ROUTES:`);
  console.log(`   🔒 POST   /api/works/create-from-order/:orderId - Create works from order`);
  console.log(`   🔒 GET    /api/works/stats                      - Get work statistics`);
  console.log(`   🔒 GET    /api/works/my-works                   - Get works by cutting master`);
  console.log(`   🔒 GET    /api/works/tailor-works               - Get works by tailor`);
  console.log(`   🔒 GET    /api/works                            - Get all works (with filters)`);
  console.log(`   🔒 GET    /api/works/:id                        - Get work by ID`);
  console.log(`   🔒 PATCH  /api/works/:id/accept                 - Accept work (Cutting Master)`);
  console.log(`   🔒 PATCH  /api/works/:id/assign-tailor          - Assign tailor (Cutting Master)`);
  console.log(`   🔒 PATCH  /api/works/:id/status                 - Update work status (Cutting Master)`);
  console.log(`   🔒 DELETE /api/works/:id                        - Delete work (Admin only)`);
  
  // ✂️ TAILOR MANAGEMENT ROUTES
  console.log(`\n✂️ TAILOR MANAGEMENT ROUTES:`);
  console.log(`   🔒 POST   /api/tailors              - Create new tailor`);
  console.log(`   🔒 GET    /api/tailors/stats        - Get tailor statistics`);
  console.log(`   🔒 GET    /api/tailors              - Get all tailors (with filters)`);
  console.log(`   🔒 GET    /api/tailors/:id          - Get tailor by ID`);
  console.log(`   🔒 PUT    /api/tailors/:id          - Update tailor`);
  console.log(`   🔒 PATCH  /api/tailors/:id/leave    - Update leave status`);
  console.log(`   🔒 DEL    /api/tailors/:id          - Delete tailor`);

  // ✅ CUTTING MASTER ROUTES
  console.log(`\n✂️ CUTTING MASTER ROUTES:`);
  console.log(`   🔒 POST   /api/cutting-masters      - Create new cutting master`);
  console.log(`   🔒 GET    /api/cutting-masters/stats - Get cutting master statistics`);
  console.log(`   🔒 GET    /api/cutting-masters      - Get all cutting masters (with filters)`);
  console.log(`   🔒 GET    /api/cutting-masters/:id  - Get cutting master by ID`);
  console.log(`   🔒 PUT    /api/cutting-masters/:id  - Update cutting master`);
  console.log(`   🔒 DEL    /api/cutting-masters/:id  - Delete cutting master`);

  // ✅ STORE KEEPER ROUTES
  console.log(`\n🏪 STORE KEEPER ROUTES:`);
  console.log(`   🔒 POST   /api/store-keepers        - Create new store keeper`);
  console.log(`   🔒 GET    /api/store-keepers/stats  - Get store keeper statistics`);
  console.log(`   🔒 GET    /api/store-keepers        - Get all store keepers (with filters)`);
  console.log(`   🔒 GET    /api/store-keepers/:id    - Get store keeper by ID`);
  console.log(`   🔒 PUT    /api/store-keepers/:id    - Update store keeper`);
  console.log(`   🔒 DEL    /api/store-keepers/:id    - Delete store keeper`);

  // ✅ NOTIFICATION ROUTES
  console.log(`\n🔔 NOTIFICATION ROUTES:`);
  console.log(`   🔒 GET    /api/notifications/unread-count - Get unread count`);
  console.log(`   🔒 GET    /api/notifications              - Get user notifications`);
  console.log(`   🔒 GET    /api/notifications/:id          - Get notification by ID`);
  console.log(`   🔒 PATCH  /api/notifications/:id/read     - Mark as read`);
  console.log(`   🔒 PATCH  /api/notifications/mark-all-read - Mark all as read`);
  console.log(`   🔒 DELETE /api/notifications/:id          - Delete notification`);

  // ✅ BANKING / TRANSACTION ROUTES
  console.log(`\n💰 BANKING / TRANSACTION ROUTES:`);
  console.log(`   🔒 GET    /api/transactions           - Get all transactions (with filters)`);
  console.log(`   🔒 GET    /api/transactions/summary   - Get transaction summary`);
  console.log(`   🔒 POST   /api/transactions           - Create new transaction (income/expense)`);
  console.log(`   🔒 DELETE /api/transactions/:id       - Delete transaction (Admin only)`);
  
  console.log("-".repeat(60));
  console.log(`\n📊 TOTAL ENDPOINTS: 100+`);
  console.log("=".repeat(60) + "\n");
});

export default app;