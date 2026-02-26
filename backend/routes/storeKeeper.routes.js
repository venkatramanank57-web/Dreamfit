// backend/routes/storeKeeper.routes.js
import express from "express";
import {
  createStoreKeeper,
  getAllStoreKeepers,
  getStoreKeeperById,
  updateStoreKeeper,
  deleteStoreKeeper,
  getStoreKeeperStats
} from "../controllers/storeKeeper.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📡 StoreKeeper Route: ${req.method} ${req.originalUrl}`);
  next();
});

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/store-keepers
 * @desc    Create new store keeper
 * @access  Admin only
 */
router.post("/", authorize("ADMIN"), createStoreKeeper);

/**
 * @route   GET /api/store-keepers/stats
 * @desc    Get store keeper statistics
 * @access  Admin only
 */
router.get("/stats", authorize("ADMIN"), getStoreKeeperStats);

/**
 * @route   GET /api/store-keepers
 * @desc    Get all store keepers
 * @access  Admin only
 */
router.get("/", authorize("ADMIN"), getAllStoreKeepers);

/**
 * @route   GET /api/store-keepers/:id
 * @desc    Get store keeper by ID
 * @access  Admin, Store Keeper (self)
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER"), getStoreKeeperById);

/**
 * @route   PUT /api/store-keepers/:id
 * @desc    Update store keeper
 * @access  Admin only
 */
router.put("/:id", authorize("ADMIN"), updateStoreKeeper);

/**
 * @route   DELETE /api/store-keepers/:id
 * @desc    Delete store keeper
 * @access  Admin only
 */
router.delete("/:id", authorize("ADMIN"), deleteStoreKeeper);

export default router;