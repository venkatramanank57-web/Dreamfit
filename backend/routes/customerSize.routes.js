// backend/routes/customerSize.routes.js
import express from "express";
import {
  getCustomerProfiles,
  getSingleProfile,
  createProfile,
  updateMeasurements,
  markProfileAsUsed,
  getMeasurementHistory,
  deleteProfile,
  getOldProfiles,
  getRecentProfiles,
  bulkCreateProfiles,
  getProfileStatistics
} from "../controllers/customerSize.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router();

// ========== PUBLIC ROUTES (If any) ==========
// (Usually all routes are protected)

// ========== PROTECTED ROUTES ==========
// All routes below require authentication
router.use(protect);

// ========== CUSTOMER-SPECIFIC ROUTES ==========

/**
 * @route   GET /api/customer-size/customer/:customerId
 * @desc    Get all size profiles for a specific customer
 * @access  Private (Admin, Store Keeper, Tailor)
 */
router.get(
  "/customer/:customerId", 
  authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), 
  getCustomerProfiles
);

/**
 * @route   GET /api/customer-size/customer/:customerId/stats
 * @desc    Get size profile statistics for a customer
 * @access  Private (Admin, Store Keeper)
 */
router.get(
  "/customer/:customerId/stats",
  authorize("ADMIN", "STORE_KEEPER"),
  getProfileStatistics
);

// ========== PROFILE MANAGEMENT ROUTES ==========

/**
 * @route   POST /api/customer-size
 * @desc    Create a new size profile
 * @access  Private (Admin, Store Keeper, Tailor)
 */
router.post(
  "/", 
  authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), 
  createProfile
);

/**
 * @route   POST /api/customer-size/bulk
 * @desc    Create multiple size profiles at once
 * @access  Private (Admin only)
 */
router.post(
  "/bulk",
  authorize("ADMIN"),
  bulkCreateProfiles
);

/**
 * @route   GET /api/customer-size/recent
 * @desc    Get recently used profiles across all customers
 * @access  Private (Admin, Store Keeper)
 */
router.get(
  "/recent",
  authorize("ADMIN", "STORE_KEEPER"),
  getRecentProfiles
);

/**
 * @route   GET /api/customer-size/old
 * @desc    Get profiles older than 3 months
 * @access  Private (Admin, Store Keeper)
 */
router.get(
  "/old",
  authorize("ADMIN", "STORE_KEEPER"),
  getOldProfiles
);

// ========== SINGLE PROFILE ROUTES ==========

/**
 * @route   GET /api/customer-size/:id
 * @desc    Get single profile by ID
 * @access  Private (Admin, Store Keeper, Tailor)
 */
router.get(
  "/:id", 
  authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), 
  getSingleProfile
);

/**
 * @route   PUT /api/customer-size/:id/measurements
 * @desc    Update measurements with history tracking
 * @access  Private (Admin, Store Keeper, Tailor)
 */
router.put(
  "/:id/measurements",
  authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"),
  updateMeasurements
);

/**
 * @route   PATCH /api/customer-size/:id/use
 * @desc    Mark profile as used (increment usage count)
 * @access  Private (Admin, Store Keeper, Tailor)
 */
router.patch(
  "/:id/use",
  authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"),
  markProfileAsUsed
);

/**
 * @route   GET /api/customer-size/:id/history
 * @desc    Get measurement change history
 * @access  Private (Admin, Store Keeper, Tailor)
 */
router.get(
  "/:id/history",
  authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"),
  getMeasurementHistory
);

/**
 * @route   DELETE /api/customer-size/:id
 * @desc    Soft delete a profile
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authorize("ADMIN"),
  deleteProfile
);

export default router;