import express from "express";
import {
  createTailor,
  getAllTailors,
  getTailorById,
  updateTailor,
  deleteTailor,
  updateLeaveStatus,
  getTailorStats
} from "../controllers/tailor.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📡 Tailor Route: ${req.method} ${req.originalUrl}`);
  next();
});

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/tailors
 * @desc    Create new tailor
 * @access  Admin, Store Keeper
 */
router.post("/", authorize("ADMIN", "STORE_KEEPER"), createTailor);

/**
 * @route   GET /api/tailors/stats
 * @desc    Get tailor statistics
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/stats", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getTailorStats);

/**
 * @route   GET /api/tailors
 * @desc    Get all tailors
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllTailors);

/**
 * @route   GET /api/tailors/:id
 * @desc    Get tailor by ID
 * @access  Admin, Store Keeper, Cutting Master, Tailor (self)
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), getTailorById);

/**
 * @route   PUT /api/tailors/:id
 * @desc    Update tailor
 * @access  Admin, Store Keeper, Tailor (self - limited fields)
 */
router.put("/:id", authorize("ADMIN", "STORE_KEEPER", "TAILOR"), updateTailor);

/**
 * @route   PATCH /api/tailors/:id/leave
 * @desc    Update leave status
 * @access  Admin, Store Keeper, Cutting Master, Tailor (self)
 */
router.patch("/:id/leave", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), updateLeaveStatus);

/**
 * @route   DELETE /api/tailors/:id
 * @desc    Delete tailor
 * @access  Admin
 */
router.delete("/:id", authorize("ADMIN"), deleteTailor);

export default router;