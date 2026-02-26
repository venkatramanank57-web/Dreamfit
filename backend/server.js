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

// ✅ ORDER MANAGEMENT ROUTES
import orderRoutes from "./routes/order.routes.js";
import garmentRoutes from "./routes/garment.routes.js";
import workRoutes from "./routes/work.routes.js";

// ✅ TAILOR MANAGEMENT ROUTES
import tailorRoutes from "./routes/tailor.routes.js";

// ✅ NOTIFICATION ROUTES
import notificationRoutes from "./routes/notification.routes.js";

// Load env variables
dotenv.config();

// Create app
const app = express();

// Connect MongoDB
connectDB();

// ==================== MIDDLEWARE ====================

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use("/api/", limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  "https://dreamfit.vercel.app", // Add your production frontend URL
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



// Static files (if needed)
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
      orders: "/api/orders",
      garments: "/api/garments",
      works: "/api/works",
      tailors: "/api/tailors",
      notifications: "/api/notifications",
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

// 📦 ORDER MANAGEMENT ROUTES - Protected
app.use("/api/orders", orderRoutes);
app.use("/api/garments", garmentRoutes);
app.use("/api/works", workRoutes);

// ✂️ TAILOR MANAGEMENT ROUTES - Protected
app.use("/api/tailors", tailorRoutes);

// 🔔 NOTIFICATION ROUTES - Protected
app.use("/api/notifications", notificationRoutes);

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists. Please use a different value.`,
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
  
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors
    });
  }
  
  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again."
    });
  }
  
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired. Please log in again."
    });
  }

  // Default error
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

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
  
  // Work Routes
  console.log(`\n   ⚙️ WORK ROUTES:`);
  console.log(`   🔒 GET    /api/works                - Get all works (with filters)`);
  console.log(`   🔒 GET    /api/works/stats          - Get work statistics`);
  console.log(`   🔒 GET    /api/works/:id            - Get work by ID`);
  console.log(`   🔒 PATCH  /api/works/:id/status     - Update work status`);
  console.log(`   🔒 PATCH  /api/works/:id/assign-tailor - Assign tailor`);
  
  // ✂️ TAILOR MANAGEMENT ROUTES
  console.log(`\n✂️ TAILOR MANAGEMENT ROUTES:`);
  console.log(`   🔒 POST   /api/tailors              - Create new tailor`);
  console.log(`   🔒 GET    /api/tailors/stats        - Get tailor statistics`);
  console.log(`   🔒 GET    /api/tailors              - Get all tailors (with filters)`);
  console.log(`   🔒 GET    /api/tailors/:id          - Get tailor by ID`);
  console.log(`   🔒 PUT    /api/tailors/:id          - Update tailor`);
  console.log(`   🔒 PATCH  /api/tailors/:id/leave    - Update leave status`);
  console.log(`   🔒 DEL    /api/tailors/:id          - Delete tailor`);
  
  // Notification Routes
  console.log(`\n   🔔 NOTIFICATION ROUTES:`);
  console.log(`   🔒 GET    /api/notifications        - Get user notifications`);
  console.log(`   🔒 PATCH  /api/notifications/:id/read - Mark as read`);
  console.log(`   🔒 PATCH  /api/notifications/mark-all-read - Mark all as read`);
  
  console.log("-".repeat(60));
  console.log(`\n📊 TOTAL ENDPOINTS: 70+`);
  console.log("=".repeat(60) + "\n");
});

export default app; 