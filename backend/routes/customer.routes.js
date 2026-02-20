// backend/routes/customer.routes.js
import express from "express";
import { 
  getCustomerByPhone, 
  createCustomer, 
  getAllCustomers,
  getCustomerById,  // ✅ Import this
  updateCustomer,   // ✅ Import this
  deleteCustomer    // ✅ Import this
} from "../controllers/customer.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// ==================== SEARCH ROUTES ====================
// Get customer by phone number
router.get("/search/:phone", authorize("ADMIN", "MANAGER", "STORE_KEEPER"), getCustomerByPhone);

// Get all customers
router.get("/all", authorize("ADMIN", "MANAGER", "STORE_KEEPER"), getAllCustomers);

// Get customer by ID - THIS WAS MISSING
router.get("/:id", authorize("ADMIN", "MANAGER", "STORE_KEEPER"), getCustomerById);

// ==================== CREATE ROUTE ====================
// Create new customer
router.post("/create", authorize("ADMIN", "MANAGER", "STORE_KEEPER"), createCustomer);

// ==================== UPDATE/DELETE ROUTES ====================
// Update customer
router.put("/:id", authorize("ADMIN", "MANAGER"), updateCustomer);

// Delete customer (only admin can delete)
router.delete("/:id", authorize("ADMIN"), deleteCustomer);

export default router;