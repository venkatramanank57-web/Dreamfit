import express from "express";
import {
  createWork,
  getAllWorks,
  getWorkById,
  getWorksByUser,
  updateWorkStatus,
  updateWork,
  deleteWork,
  getWorkStats,
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
 * @route   POST /api/works
 * @desc    Create new work assignment
 * @access  Admin, Store Keeper
 */
router.post("/", authorize("ADMIN", "STORE_KEEPER"), createWork);

/**
 * @route   GET /api/works
 * @desc    Get all work assignments with filters
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllWorks);

/**
 * @route   GET /api/works/stats
 * @desc    Get work statistics
 * @access  Admin, Store Keeper
 */
router.get("/stats", authorize("ADMIN", "STORE_KEEPER"), getWorkStats);

/**
 * @route   GET /api/works/user/:userId
 * @desc    Get works assigned to specific user
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/user/:userId", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getWorksByUser);

/**
 * @route   GET /api/works/:id
 * @desc    Get work by ID
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getWorkById);

/**
 * @route   PATCH /api/works/:id/status
 * @desc    Update work status
 * @access  Cutting Master, Admin
 */
router.patch("/:id/status", authorize("CUTTING_MASTER", "ADMIN"), updateWorkStatus);

/**
 * @route   PUT /api/works/:id
 * @desc    Update work details (reassign, notes)
 * @access  Admin, Store Keeper
 */
router.put("/:id", authorize("ADMIN", "STORE_KEEPER"), updateWork);

/**
 * @route   DELETE /api/works/:id
 * @desc    Delete work assignment
 * @access  Admin
 */
router.delete("/:id", authorize("ADMIN"), deleteWork);

export default router;