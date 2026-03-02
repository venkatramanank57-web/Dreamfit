// routes/work.routes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  createWorksFromOrder,
  getWorks,
  getWorkById,
  acceptWork,
  assignTailor,
  updateWorkStatus,
  deleteWork,
  getWorksByCuttingMaster,
  getWorksByTailor,
  getWorkStats,
  assignCuttingMaster
} from '../controllers/work.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============================================
// SPECIAL ROUTES (must come BEFORE /:id)
// ============================================

/**
 * @route   POST /api/works/create-from-order/:orderId
 * @desc    Create works for each garment in an order
 * @access  Admin, Store Keeper
 */
router.post(
  '/create-from-order/:orderId',
  authorize('ADMIN', 'STORE_KEEPER'),
  createWorksFromOrder
);

/**
 * @route   PATCH /api/works/:id/assign-cutting-master
 * @desc    Assign a cutting master to a work (manual assignment)
 * @access  Admin, Store Keeper, Cutting Master
 */
router.patch(
  '/:id/assign-cutting-master', 
  authorize('ADMIN', 'STORE_KEEPER', 'CUTTING_MASTER'), 
  assignCuttingMaster
);

/**
 * @route   GET /api/works/stats
 * @desc    Get work statistics for dashboard
 * @access  Admin, Store Keeper
 */
router.get(
  '/stats', 
  authorize('ADMIN', 'STORE_KEEPER'), 
  getWorkStats
);

/**
 * @route   GET /api/works/my-works
 * @desc    Get works assigned to the logged-in cutting master
 * @access  Cutting Master
 */
router.get(
  '/my-works', 
  authorize('CUTTING_MASTER'), 
  getWorksByCuttingMaster
);

/**
 * @route   GET /api/works/tailor-works
 * @desc    Get works assigned to the logged-in tailor
 * @access  Tailor
 */
router.get(
  '/tailor-works', 
  authorize('TAILOR'), 
  getWorksByTailor
);

// ============================================
// MAIN ROUTES
// ============================================

/**
 * @route   GET /api/works
 * @desc    Get all works with filters (pagination, status, etc.)
 * @access  Admin, Store Keeper
 */
router.get(
  '/', 
  authorize('ADMIN', 'STORE_KEEPER'), 
  getWorks
);

// ============================================
// DYNAMIC ROUTES (with :id) - MUST come LAST
// ============================================

/**
 * @route   GET /api/works/:id
 * @desc    Get work by ID
 * @access  All authenticated users
 */
router.get('/:id', getWorkById);

/**
 * @route   PATCH /api/works/:id/accept
 * @desc    Accept a work (changes from pending to accepted)
 * @access  Cutting Master only
 */
router.patch(
  '/:id/accept', 
  authorize('CUTTING_MASTER'), 
  acceptWork
);

/**
 * @route   PATCH /api/works/:id/assign-tailor
 * @desc    Assign a tailor to a work
 * @access  Cutting Master only
 */
router.patch(
  '/:id/assign-tailor', 
  authorize('CUTTING_MASTER'), 
  assignTailor
);

/**
 * @route   PATCH /api/works/:id/status
 * @desc    Update work status (cutting-started, cutting-completed, etc.)
 * @access  Cutting Master only
 */
router.patch(
  '/:id/status', 
  authorize('CUTTING_MASTER'), 
  updateWorkStatus
);

/**
 * @route   DELETE /api/works/:id
 * @desc    Soft delete a work
 * @access  Admin only
 */
router.delete(
  '/:id', 
  authorize('ADMIN'), 
  deleteWork
);

export default router;