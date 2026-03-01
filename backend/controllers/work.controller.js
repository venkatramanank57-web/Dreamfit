// controllers/work.controller.js
import Work from '../models/Work.js';
import Order from '../models/Order.js';
import Garment from '../models/Garment.js';
import Notification from '../models/Notification.js';
import { createNotification } from './notification.controller.js';

// @desc    Create work for each garment in an order
// @route   POST /api/works/create-from-order/:orderId
// @access  Private (Store Keeper, Admin)
export const createWorksFromOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get order with garments
    const order = await Order.findById(orderId)
      .populate('garments');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const works = [];
    
    // Create work for each garment
    for (const garment of order.garments) {
      // Generate measurement PDF (you can implement PDF generation later)
      const measurementPdf = await generateMeasurementPdf(garment);
      
      const work = await Work.create({
        order: orderId,
        garment: garment._id,
        estimatedDelivery: garment.estimatedDelivery,
        createdBy: req.user._id,
        measurementPdf
      });
      
      works.push(work);
      
      // Notify all cutting masters
      await createNotification({
        type: 'work-assigned',
        recipient: null, // Will be sent to all cutting masters
        title: 'New Work Assigned',
        message: `New work created for ${garment.name}`,
        reference: {
          orderId: order._id,
          workId: work._id,
          garmentId: garment._id
        },
        priority: 'high'
      });
    }

    res.status(201).json({
      success: true,
      message: `Created ${works.length} works`,
      data: works
    });

  } catch (error) {
    console.error('Create works error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create works',
      error: error.message
    });
  }
};

// @desc    Get all works (with filters)
// @route   GET /api/works
// @access  Private
export const getWorks = async (req, res) => {
  try {
    const {
      status,
      cuttingMaster,
      tailor,
      orderId,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (cuttingMaster) filter.cuttingMaster = cuttingMaster;
    if (tailor) filter.tailor = tailor;
    if (orderId) filter.order = orderId;

    // Date range filter
    if (startDate || endDate) {
      filter.workDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.workDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.workDate.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const works = await Work.find(filter)
      .populate('order', 'orderId customer')
      .populate('garment', 'name garmentId measurements')
      .populate('cuttingMaster', 'name')
      .populate('tailor', 'name employeeId')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Work.countDocuments(filter);

    res.json({
      success: true,
      data: {
        works,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get works error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch works',
      error: error.message
    });
  }
};

// @desc    Get work by ID
// @route   GET /api/works/:id
// @access  Private
export const getWorkById = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate('order', 'orderId customer orderDate deliveryDate')
      .populate('garment')
      .populate('cuttingMaster', 'name')
      .populate('tailor', 'name employeeId phone')
      .populate('createdBy', 'name');

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    res.json({
      success: true,
      data: work
    });

  } catch (error) {
    console.error('Get work error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch work',
      error: error.message
    });
  }
};

// @desc    Accept work (Cutting Master)
// @route   PATCH /api/works/:id/accept
// @access  Private (Cutting Master only)
export const acceptWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate('order')
      .populate('garment');

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // Check if already accepted
    if (work.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Work already accepted or in progress'
      });
    }

    // Update work
    work.status = 'accepted';
    work.cuttingMaster = req.user._id;
    work.acceptedAt = new Date();
    await work.save();

    // Update order status to confirmed
    await Order.findByIdAndUpdate(work.order._id, {
      status: 'confirmed'
    });

    // Notify store keeper
    await createNotification({
      type: 'work-accepted',
      recipient: work.order.createdBy,
      title: 'Work Accepted',
      message: `Cutting master accepted work for ${work.garment.name}`,
      reference: {
        orderId: work.order._id,
        workId: work._id,
        garmentId: work.garment._id
      },
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Work accepted successfully',
      data: work
    });

  } catch (error) {
    console.error('Accept work error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept work',
      error: error.message
    });
  }
};

// @desc    Assign tailor to work (Cutting Master)
// @route   PATCH /api/works/:id/assign-tailor
// @access  Private (Cutting Master only)
export const assignTailor = async (req, res) => {
  try {
    const { tailorId } = req.body;
    const work = await Work.findById(req.params.id)
      .populate('order')
      .populate('garment');

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // Check if cutting master is assigned
    if (work.cuttingMaster.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign tailor for this work'
      });
    }

    // Update work
    work.tailor = tailorId;
    await work.save();

    // Notify tailor
    await createNotification({
      type: 'tailor-assigned',
      recipient: tailorId,
      title: 'New Work Assigned',
      message: `You have been assigned to work on ${work.garment.name}`,
      reference: {
        orderId: work.order._id,
        workId: work._id,
        garmentId: work.garment._id
      },
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Tailor assigned successfully',
      data: work
    });

  } catch (error) {
    console.error('Assign tailor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign tailor',
      error: error.message
    });
  }
};

// @desc    Update work status (Cutting Master)
// @route   PATCH /api/works/:id/status
// @access  Private (Cutting Master only)
export const updateWorkStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const work = await Work.findById(req.params.id)
      .populate('order')
      .populate('garment');

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // ✅ FIXED: Check if cuttingMaster exists before comparing
    if (work.cuttingMaster && work.cuttingMaster.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this work'
      });
    }

    // If no cutting master assigned, allow the current user to become the cutting master
    if (!work.cuttingMaster) {
      work.cuttingMaster = req.user._id;
      console.log(`✅ Auto-assigned cutting master ${req.user._id} to work ${work._id}`);
    }

    // Update status and set corresponding timestamp
    const statusUpdates = {
      'cutting-started': { cuttingStartedAt: new Date() },
      'cutting-completed': { cuttingCompletedAt: new Date() },
      'sewing-started': { sewingStartedAt: new Date() },
      'sewing-completed': { sewingCompletedAt: new Date() },
      'ironing': { ironingAt: new Date() },
      'ready-to-deliver': { readyAt: new Date() }
    };

    const updateData = {
      status,
      ...(statusUpdates[status] || {}),
      ...(notes && { 
        [status.includes('cutting') ? 'cuttingNotes' : 'tailorNotes']: notes 
      })
    };

    // Apply updates
    Object.assign(work, updateData);
    await work.save();

    // Notify store keeper about status update
    await createNotification({
      type: 'work-status-update',
      recipient: work.order.createdBy,
      title: 'Work Status Updated',
      message: `${work.garment.name} is now ${status.replace(/-/g, ' ')}`,
      reference: {
        orderId: work.order._id,
        workId: work._id,
        garmentId: work.garment._id
      }
    });

    res.json({
      success: true,
      message: 'Work status updated successfully',
      data: work
    });

  } catch (error) {
    console.error('Update work status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update work status',
      error: error.message
    });
  }
};

// @desc    Delete work (Admin only)
// @route   DELETE /api/works/:id
// @access  Private (Admin only)
export const deleteWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // Only admin can delete
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete works'
      });
    }

    await work.deleteOne();

    res.json({
      success: true,
      message: 'Work deleted successfully'
    });

  } catch (error) {
    console.error('Delete work error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete work',
      error: error.message
    });
  }
};

// @desc    Get work statistics
// @route   GET /api/works/stats
// @access  Private (Admin, Store Keeper)
export const getWorkStats = async (req, res) => {
  try {
    console.log('📊 Fetching work statistics...');
    
    // Aggregate work statistics by status
    const stats = await Work.aggregate([
      {
        $group: {
          _id: null,
          totalWorks: { $sum: 1 },
          pendingWorks: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          acceptedWorks: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          cuttingStarted: {
            $sum: { $cond: [{ $eq: ['$status', 'cutting-started'] }, 1, 0] }
          },
          cuttingCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'cutting-completed'] }, 1, 0] }
          },
          sewingStarted: {
            $sum: { $cond: [{ $eq: ['$status', 'sewing-started'] }, 1, 0] }
          },
          sewingCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'sewing-completed'] }, 1, 0] }
          },
          ironing: {
            $sum: { $cond: [{ $eq: ['$status', 'ironing'] }, 1, 0] }
          },
          readyToDeliver: {
            $sum: { $cond: [{ $eq: ['$status', 'ready-to-deliver'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get today's works
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayWorks = await Work.countDocuments({
      createdAt: { $gte: today }
    });

    // Get overdue works (estimated delivery passed and not ready)
    const overdueWorks = await Work.countDocuments({
      estimatedDelivery: { $lt: new Date() },
      status: { $ne: 'ready-to-deliver' }
    });

    const result = stats[0] || {
      totalWorks: 0,
      pendingWorks: 0,
      acceptedWorks: 0,
      cuttingStarted: 0,
      cuttingCompleted: 0,
      sewingStarted: 0,
      sewingCompleted: 0,
      ironing: 0,
      readyToDeliver: 0
    };

    res.json({
      success: true,
      data: {
        ...result,
        todayWorks,
        overdueWorks
      }
    });

  } catch (error) {
    console.error('❌ Get work stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch work statistics',
      error: error.message 
    });
  }
};

// ✅ FIXED: Get works by cutting master
// @route   GET /api/works/my-works
// @access  Private (Cutting Master only)
export const getWorksByCuttingMaster = async (req, res) => {
  try {
    // Get cutting master ID from multiple possible locations
    const cuttingMasterId = req.user?._id || req.user?.id;
    
    console.log('📋 Getting works for cutting master:', {
      fromReqUser: req.user,
      extractedId: cuttingMasterId
    });
    
    if (!cuttingMasterId) {
      console.error('❌ No cutting master ID found');
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }

    const { status, page = 1, limit = 20 } = req.query;

    // ✅ FIX: Simple filter - MongoDB handles conversion
    const filter = { 
      cuttingMaster: cuttingMasterId,
      isActive: true 
    };
    
    console.log('🔍 Filter being applied:', filter);

    if (status && status !== 'all' && status !== '') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const works = await Work.find(filter)
      .populate({
        path: 'order',
        select: 'orderId customer',
        populate: {
          path: 'customer',
          select: 'name phone'
        }
      })
      .populate({
        path: 'garment',
        select: 'name garmentId'
      })
      .populate('tailor', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`✅ Found ${works.length} works for cutting master ${cuttingMasterId}`);
    
    const total = await Work.countDocuments(filter);

    res.json({
      success: true,
      data: {
        works,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ Get cutting master works error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch works',
      error: error.message
    });
  }
};

// @desc    Get works by tailor
// @route   GET /api/works/tailor-works
// @access  Private (Tailor only)
export const getWorksByTailor = async (req, res) => {
  try {
    const tailorId = req.user?._id || req.user?.id;
    
    if (!tailorId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }

    const { status, page = 1, limit = 20 } = req.query;

    const filter = { 
      tailor: tailorId,
      isActive: true 
    };
    
    if (status && status !== 'all' && status !== '') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const works = await Work.find(filter)
      .populate({
        path: 'order',
        select: 'orderId customer',
        populate: {
          path: 'customer',
          select: 'name'
        }
      })
      .populate({
        path: 'garment',
        select: 'name garmentId measurements'
      })
      .populate('cuttingMaster', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Work.countDocuments(filter);

    res.json({
      success: true,
      data: {
        works,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get tailor works error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch works',
      error: error.message
    });
  }
};

// Helper function to generate measurement PDF (NOT exported)
const generateMeasurementPdf = async (garment) => {
  // TODO: Implement PDF generation
  // For now, return a placeholder URL
  return `https://storage.example.com/measurements/${garment.garmentId}.pdf`;
};

// ✅ NO EXPORT OBJECT AT THE BOTTOM - Each function is already exported with 'export' keyword