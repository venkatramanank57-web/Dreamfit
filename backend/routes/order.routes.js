import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,           // ✅ IMPORT this
  updateOrderStatus,
  deleteOrder,
  getOrderStats
} from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Debug middleware to track API hits
router.use((req, res, next) => {
  console.log(`📡 Order Route: ${req.method} ${req.originalUrl}`);
  next();
});

// All routes are PROTECTED (Must be logged in)
router.use(protect);

/**
 * @route   GET /api/orders/stats
 * @desc    Get order statistics (Today, Weekly, Monthly)
 * @access  Admin, Store Keeper
 */
router.get("/stats", authorize("ADMIN", "STORE_KEEPER"), getOrderStats);

/**
 * @route   POST /api/orders
 * @desc    Create new order (Initial status: DRAFT)
 * @access  Admin, Store Keeper
 */
router.post("/", authorize("ADMIN", "STORE_KEEPER"), createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get all orders with filters (Week, Month, Year as you requested)
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get specific order details
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrderById);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order details (delivery date, notes, payment, etc.)
 * @access  Admin, Store Keeper
 */
router.put("/:id", authorize("ADMIN", "STORE_KEEPER"), updateOrder);   // ✅ ADD THIS ROUTE

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status (Confirmed, Delivered, etc.)
 * @access  Admin, Store Keeper
 */
router.patch("/:id/status", authorize("ADMIN", "STORE_KEEPER"), updateOrderStatus);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete order (RESTRICTED TO ADMIN ONLY as per your logic)
 * @access  Admin
 */
router.delete("/:id", authorize("ADMIN"), deleteOrder);

export default router;