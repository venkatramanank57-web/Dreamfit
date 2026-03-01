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
  getWorkStats
} from '../controllers/work.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ===== SPECIAL ROUTES (must come BEFORE /:id) =====

// Create works from order (Store Keeper, Admin)
router.post(
  '/create-from-order/:orderId',
  authorize('ADMIN', 'STORE_KEEPER'),
  createWorksFromOrder
);

// ✅ Get work statistics - MUST come BEFORE /:id
router.get('/stats', authorize('ADMIN', 'STORE_KEEPER'), getWorkStats);

// Get works by cutting master
router.get('/my-works', authorize('CUTTING_MASTER'), getWorksByCuttingMaster);

// Get works by tailor
router.get('/tailor-works', authorize('TAILOR'), getWorksByTailor);

// ===== MAIN ROUTES =====

// Get all works (Admin, Store Keeper)
router.get('/', authorize('ADMIN', 'STORE_KEEPER'), getWorks);

// ===== DYNAMIC ROUTES (with :id) - MUST come LAST =====

// Get work by ID (All roles)
router.get('/:id', getWorkById);

// Accept work (Cutting Master only)
router.patch('/:id/accept', authorize('CUTTING_MASTER'), acceptWork);

// Assign tailor (Cutting Master only)
router.patch('/:id/assign-tailor', authorize('CUTTING_MASTER'), assignTailor);

// Update work status (Cutting Master only)
router.patch('/:id/status', authorize('CUTTING_MASTER'), updateWorkStatus);

// Delete work (Admin only)
router.delete('/:id', authorize('ADMIN'), deleteWork);

export default router;