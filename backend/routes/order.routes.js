import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📡 Order Route: ${req.method} ${req.originalUrl}`);
  next();
});

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Admin, Store Keeper
 */
router.post("/", authorize("ADMIN", "STORE_KEEPER"), createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get all orders with filters
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrderById);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Admin, Store Keeper
 */
router.patch("/:id/status", authorize("ADMIN", "STORE_KEEPER"), updateOrderStatus);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete order (soft delete)
 * @access  Admin
 */
router.delete("/:id", authorize("ADMIN"), deleteOrder);

export default router;