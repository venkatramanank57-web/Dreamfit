import express from "express";
import {
  getAllWorks,
  getWorkById,
  updateWorkStatus,
  assignTailor,
  getDashboardStats
} from "../controllers/work.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📡 Work Route: ${req.method} ${req.originalUrl}`);
  next();
});

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/works
 * @desc    Get all works with filters
 * @access  Admin, Store Keeper, Cutting Master, Tailor
 */
router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), getAllWorks);

/**
 * @route   GET /api/works/stats
 * @desc    Get dashboard statistics
 * @access  Admin, Store Keeper, Cutting Master, Tailor
 */
router.get("/stats", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), getDashboardStats);

/**
 * @route   GET /api/works/:id
 * @desc    Get work by ID
 * @access  Admin, Store Keeper, Cutting Master, Tailor
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), getWorkById);

/**
 * @route   PATCH /api/works/:id/status
 * @desc    Update work status
 * @access  Cutting Master
 */
router.patch("/:id/status", authorize("CUTTING_MASTER"), updateWorkStatus);

/**
 * @route   PATCH /api/works/:id/assign-tailor
 * @desc    Assign tailor to work
 * @access  Cutting Master
 */
router.patch("/:id/assign-tailor", authorize("CUTTING_MASTER"), assignTailor);

export default router;