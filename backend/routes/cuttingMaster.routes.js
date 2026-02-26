// backend/routes/cuttingMaster.routes.js
import express from "express";
import {
  createCuttingMaster,
  getAllCuttingMasters,
  getCuttingMasterById,
  updateCuttingMaster,
  deleteCuttingMaster,
  getCuttingMasterStats
} from "../controllers/cuttingMaster.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📡 CuttingMaster Route: ${req.method} ${req.originalUrl}`);
  next();
});

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/cutting-masters
 * @desc    Create new cutting master
 * @access  Admin only
 */
router.post("/", authorize("ADMIN"), createCuttingMaster);

/**
 * @route   GET /api/cutting-masters/stats
 * @desc    Get cutting master statistics
 * @access  Admin, Store Keeper
 */
router.get("/stats", authorize("ADMIN", "STORE_KEEPER"), getCuttingMasterStats);

/**
 * @route   GET /api/cutting-masters
 * @desc    Get all cutting masters
 * @access  Admin, Store Keeper
 */
router.get("/", authorize("ADMIN", "STORE_KEEPER"), getAllCuttingMasters);

/**
 * @route   GET /api/cutting-masters/:id
 * @desc    Get cutting master by ID
 * @access  Admin, Store Keeper, Cutting Master (self)
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getCuttingMasterById);

/**
 * @route   PUT /api/cutting-masters/:id
 * @desc    Update cutting master
 * @access  Admin, Store Keeper
 */
router.put("/:id", authorize("ADMIN", "STORE_KEEPER"), updateCuttingMaster);

/**
 * @route   DELETE /api/cutting-masters/:id
 * @desc    Delete cutting master
 * @access  Admin only
 */
router.delete("/:id", authorize("ADMIN"), deleteCuttingMaster);

export default router;