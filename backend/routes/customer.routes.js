// backend/routes/customer.routes.js
import express from "express";
import { 
  getCustomerByPhone,
  getCustomerByCustomerId, // ✅ Import the new function
  createCustomer, 
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerStats
} from "../controllers/customer.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

console.log("📁 customer.routes.js is loading...");
console.log("   getCustomerByPhone:", getCustomerByPhone ? "✅" : "❌");
console.log("   getCustomerByCustomerId:", getCustomerByCustomerId ? "✅" : "❌");
console.log("   createCustomer:", createCustomer ? "✅" : "❌");
console.log("   getAllCustomers:", getAllCustomers ? "✅" : "❌");
console.log("   getCustomerStats:", getCustomerStats ? "✅" : "❌");
console.log("   protect:", protect ? "✅" : "❌");

const router = express.Router();

// All routes are protected
router.use(protect);

// ==================== SEARCH ROUTES ====================

// 🔍 Search by Phone Number
router.get("/search/phone/:phone", authorize("ADMIN", "MANAGER", "STORE_KEEPER"), getCustomerByPhone);

// 🔍 Search by Customer ID (CUST-2024-00001 format) - ✅ NEW ROUTE
router.get("/search/id/:customerId", authorize("ADMIN", "MANAGER", "STORE_KEEPER"), getCustomerByCustomerId);

// ==================== LIST ROUTES ====================

// 📋 Get all customers
router.get("/all", authorize("ADMIN", "MANAGER", "STORE_KEEPER"), getAllCustomers);

// 📊 Get customer statistics (Admin only)
router.get("/stats", authorize("ADMIN"), getCustomerStats);

// ==================== SINGLE CUSTOMER ROUTES ====================

// 👤 Get customer by MongoDB ID
router.get("/:id", authorize("ADMIN", "MANAGER", "STORE_KEEPER"), getCustomerById);

// 🆕 Create new customer
router.post("/create", authorize("ADMIN", "MANAGER", "STORE_KEEPER"), createCustomer);

// ✏️ Update customer
router.put("/:id", authorize("ADMIN", "MANAGER"), updateCustomer);

// ❌ Delete customer
router.delete("/:id", authorize("ADMIN"), deleteCustomer);

console.log("   router:", router ? "✅ Created" : "❌ Failed");
console.log("   ✅ Routes added successfully:");
console.log("      GET  /search/phone/:phone    - Search by phone");
console.log("      GET  /search/id/:customerId  - Search by customer ID"); // ✅ New
console.log("      GET  /all                    - Get all customers");
console.log("      GET  /stats                   - Get statistics");
console.log("      GET  /:id                     - Get by MongoDB ID");
console.log("      POST /create                  - Create customer");
console.log("      PUT  /:id                     - Update customer");
console.log("      DEL  /:id                     - Delete customer");

export default router;