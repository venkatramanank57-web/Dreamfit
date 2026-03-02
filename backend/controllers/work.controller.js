// // controllers/work.controller.js
// import Work from '../models/Work.js';
// import Order from '../models/Order.js';
// import Garment from '../models/Garment.js';
// import Notification from '../models/Notification.js';
// import { createNotification } from './notification.controller.js';

// // @desc    Create work for each garment in an order
// // @route   POST /api/works/create-from-order/:orderId
// // @access  Private (Store Keeper, Admin)
// export const createWorksFromOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     // Get order with garments
//     const order = await Order.findById(orderId)
//       .populate('garments');
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     const works = [];
    
//     // Create work for each garment
//     for (const garment of order.garments) {
//       // Generate measurement PDF (you can implement PDF generation later)
//       const measurementPdf = await generateMeasurementPdf(garment);
      
//       const work = await Work.create({
//         order: orderId,
//         garment: garment._id,
//         estimatedDelivery: garment.estimatedDelivery,
//         createdBy: req.user._id,
//         measurementPdf
//       });
      
//       works.push(work);
      
//       // Notify all cutting masters
//       await createNotification({
//         type: 'work-assigned',
//         recipient: null, // Will be sent to all cutting masters
//         title: 'New Work Assigned',
//         message: `New work created for ${garment.name}`,
//         reference: {
//           orderId: order._id,
//           workId: work._id,
//           garmentId: garment._id
//         },
//         priority: 'high'
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: `Created ${works.length} works`,
//       data: works
//     });

//   } catch (error) {
//     console.error('Create works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get all works (with filters)
// // @route   GET /api/works
// // @access  Private
// export const getWorks = async (req, res) => {
//   try {
//     const {
//       status,
//       cuttingMaster,
//       tailor,
//       orderId,
//       startDate,
//       endDate,
//       page = 1,
//       limit = 20
//     } = req.query;

//     const filter = {};

//     if (status) filter.status = status;
//     if (cuttingMaster) filter.cuttingMaster = cuttingMaster;
//     if (tailor) filter.tailor = tailor;
//     if (orderId) filter.order = orderId;

//     // Date range filter
//     if (startDate || endDate) {
//       filter.workDate = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         filter.workDate.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.workDate.$lte = end;
//       }
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate('order', 'orderId customer')
//       .populate('garment', 'name garmentId measurements')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId')
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get work by ID
// // @route   GET /api/works/:id
// // @access  Private
// export const getWorkById = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id)
//       .populate('order', 'orderId customer orderDate deliveryDate')
//       .populate('garment')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId phone')
//       .populate('createdBy', 'name');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: work
//     });

//   } catch (error) {
//     console.error('Get work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch work',
//       error: error.message
//     });
//   }
// };

// // @desc    Accept work (Cutting Master)
// // @route   PATCH /api/works/:id/accept
// // @access  Private (Cutting Master only)
// export const acceptWork = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // Check if already accepted
//     if (work.status !== 'pending') {
//       return res.status(400).json({
//         success: false,
//         message: 'Work already accepted or in progress'
//       });
//     }

//     // Update work
//     work.status = 'accepted';
//     work.cuttingMaster = req.user._id;
//     work.acceptedAt = new Date();
//     await work.save();

//     // Update order status to confirmed
//     await Order.findByIdAndUpdate(work.order._id, {
//       status: 'confirmed'
//     });

//     // Notify store keeper
//     await createNotification({
//       type: 'work-accepted',
//       recipient: work.order.createdBy,
//       title: 'Work Accepted',
//       message: `Cutting master accepted work for ${work.garment.name}`,
//       reference: {
//         orderId: work.order._id,
//         workId: work._id,
//         garmentId: work.garment._id
//       },
//       priority: 'high'
//     });

//     res.json({
//       success: true,
//       message: 'Work accepted successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('Accept work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to accept work',
//       error: error.message
//     });
//   }
// };

// // @desc    Assign tailor to work (Cutting Master)
// // @route   PATCH /api/works/:id/assign-tailor
// // @access  Private (Cutting Master only)
// // controllers/work.controller.js - FIXED assignTailor

// export const assignTailor = async (req, res) => {
//   try {
//     const { tailorId } = req.body;
//     const work = await Work.findById(req.params.id)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // ✅ FIXED: Check if cuttingMaster exists before comparing
//     if (!work.cuttingMaster) {
//       // If no cutting master, assign the current user as cutting master
//       work.cuttingMaster = req.user._id;
//       console.log(`✅ Auto-assigned cutting master ${req.user._id} to work ${work._id}`);
//     } else if (work.cuttingMaster.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to assign tailor for this work'
//       });
//     }

//     // Update work
//     work.tailor = tailorId;
//     await work.save();

//     // ✅ FIXED: Check if notification was created successfully
//     try {
//       await createNotification({
//         type: 'tailor-assigned',
//         recipient: tailorId,
//         title: 'New Work Assigned',
//         message: `You have been assigned to work on ${work.garment.name}`,
//         reference: {
//           orderId: work.order._id,
//           workId: work._id,
//           garmentId: work.garment._id
//         },
//         priority: 'high'
//       });
//       console.log(`✅ Notification sent to tailor ${tailorId}`);
//     } catch (notifError) {
//       console.error('❌ Failed to send notification:', notifError);
//       // Don't fail the whole request if notification fails
//     }

//     res.json({
//       success: true,
//       message: 'Tailor assigned successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('❌ Assign tailor error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to assign tailor',
//       error: error.message
//     });
//   }
// };

// // @desc    Update work status (Cutting Master)
// // @route   PATCH /api/works/:id/status
// // @access  Private (Cutting Master only)
// // @desc    Update work status (Cutting Master)
// // @route   PATCH /api/works/:id/status
// // @access  Private (Cutting Master only)
// export const updateWorkStatus = async (req, res) => {
//   console.log('\n🔄 ===== UPDATE WORK STATUS CALLED =====');
//   console.log('Request params:', req.params);
//   console.log('Request body:', req.body);
//   console.log('User:', req.user?._id || req.user?.id);
  
//   try {
//     const { status, notes } = req.body;
//     const workId = req.params.id;

//     console.log('1️⃣ Finding work with ID:', workId);
//     const work = await Work.findById(workId)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       console.log('❌ Work not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     console.log('2️⃣ Work found:', {
//       id: work._id,
//       currentStatus: work.status,
//       cuttingMaster: work.cuttingMaster,
//       hasGarment: !!work.garment,
//       hasOrder: !!work.order
//     });

//     // ✅ Check if cutting master exists before comparing
//     console.log('3️⃣ Checking authorization...');
//     if (work.cuttingMaster) {
//       console.log('   Cutting master exists:', work.cuttingMaster.toString());
//       console.log('   Current user:', req.user._id.toString());
      
//       if (work.cuttingMaster.toString() !== req.user._id.toString()) {
//         console.log('❌ Unauthorized - cutting master mismatch');
//         return res.status(403).json({
//           success: false,
//           message: 'Not authorized to update this work'
//         });
//       }
//       console.log('✅ Authorization passed');
//     } else {
//       console.log('⚠️ No cutting master assigned, auto-assigning current user');
//       work.cuttingMaster = req.user._id;
//     }

//     // Validate status
//     console.log('4️⃣ Validating status:', status);
//     const validStatuses = [
//       'pending', 'accepted', 'cutting-started', 'cutting-completed',
//       'sewing-started', 'sewing-completed', 'ironing', 'ready-to-deliver'
//     ];

//     if (!validStatuses.includes(status)) {
//       console.log('❌ Invalid status:', status);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
//     console.log('✅ Status valid');

//     // Update status and set corresponding timestamp
//     console.log('5️⃣ Updating work data...');
//     const statusUpdates = {
//       'cutting-started': { cuttingStartedAt: new Date() },
//       'cutting-completed': { cuttingCompletedAt: new Date() },
//       'sewing-started': { sewingStartedAt: new Date() },
//       'sewing-completed': { sewingCompletedAt: new Date() },
//       'ironing': { ironingAt: new Date() },
//       'ready-to-deliver': { readyAt: new Date() }
//     };

//     // Update work
//     work.status = status;
    
//     // Add timestamp if applicable
//     if (statusUpdates[status]) {
//       Object.assign(work, statusUpdates[status]);
//       console.log(`   Set timestamp for ${status}`);
//     }
    
//     // Add notes if provided
//     if (notes) {
//       if (status.includes('cutting')) {
//         work.cuttingNotes = notes;
//         console.log('   Added cutting notes');
//       } else {
//         work.tailorNotes = notes;
//         console.log('   Added tailor notes');
//       }
//     }

//     console.log('6️⃣ Saving work...');
//     await work.save();
//     console.log('✅ Work saved successfully');

//     // Try to send notification
//     console.log('7️⃣ Sending notification...');
//     try {
//       if (work.order && work.order.createdBy) {
//         await createNotification({
//           type: 'work-status-update',
//           recipient: work.order.createdBy,
//           title: 'Work Status Updated',
//           message: `${work.garment?.name || 'Garment'} is now ${status.replace(/-/g, ' ')}`,
//           reference: {
//             orderId: work.order._id,
//             workId: work._id,
//             garmentId: work.garment?._id
//           }
//         });
//         console.log('✅ Notification sent');
//       } else {
//         console.log('⚠️ Cannot send notification - missing order or createdBy');
//       }
//     } catch (notifError) {
//       console.log('⚠️ Notification failed:', notifError.message);
//       // Don't fail the request if notification fails
//     }

//     console.log('8️⃣ Sending success response');
//     console.log('🔄 ===== UPDATE WORK STATUS COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       message: 'Work status updated successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('\n❌ ===== UPDATE WORK STATUS ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     if (error.code) console.error('Error code:', error.code);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update work status',
//       error: error.message
//     });
//   }
// };

// // @desc    Delete work (Admin only)
// // @route   DELETE /api/works/:id
// // @access  Private (Admin only)
// export const deleteWork = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id);

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // Only admin can delete
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only admin can delete works'
//       });
//     }

//     await work.deleteOne();

//     res.json({
//       success: true,
//       message: 'Work deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete work',
//       error: error.message
//     });
//   }
// };

// // @desc    Get work statistics
// // @route   GET /api/works/stats
// // @access  Private (Admin, Store Keeper)
// export const getWorkStats = async (req, res) => {
//   try {
//     console.log('📊 Fetching work statistics...');
    
//     // Aggregate work statistics by status
//     const stats = await Work.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalWorks: { $sum: 1 },
//           pendingWorks: {
//             $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
//           },
//           acceptedWorks: {
//             $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
//           },
//           cuttingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-started'] }, 1, 0] }
//           },
//           cuttingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-completed'] }, 1, 0] }
//           },
//           sewingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-started'] }, 1, 0] }
//           },
//           sewingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-completed'] }, 1, 0] }
//           },
//           ironing: {
//             $sum: { $cond: [{ $eq: ['$status', 'ironing'] }, 1, 0] }
//           },
//           readyToDeliver: {
//             $sum: { $cond: [{ $eq: ['$status', 'ready-to-deliver'] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     // Get today's works
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayWorks = await Work.countDocuments({
//       createdAt: { $gte: today }
//     });

//     // Get overdue works (estimated delivery passed and not ready)
//     const overdueWorks = await Work.countDocuments({
//       estimatedDelivery: { $lt: new Date() },
//       status: { $ne: 'ready-to-deliver' }
//     });

//     const result = stats[0] || {
//       totalWorks: 0,
//       pendingWorks: 0,
//       acceptedWorks: 0,
//       cuttingStarted: 0,
//       cuttingCompleted: 0,
//       sewingStarted: 0,
//       sewingCompleted: 0,
//       ironing: 0,
//       readyToDeliver: 0
//     };

//     res.json({
//       success: true,
//       data: {
//         ...result,
//         todayWorks,
//         overdueWorks
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get work stats error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch work statistics',
//       error: error.message 
//     });
//   }
// };

// // ✅ FIXED: Get works by cutting master
// // @route   GET /api/works/my-works
// // @access  Private (Cutting Master only)
// export const getWorksByCuttingMaster = async (req, res) => {
//   try {
//     // Get cutting master ID from multiple possible locations
//     const cuttingMasterId = req.user?._id || req.user?.id;
    
//     console.log('📋 Getting works for cutting master:', {
//       fromReqUser: req.user,
//       extractedId: cuttingMasterId
//     });
    
//     if (!cuttingMasterId) {
//       console.error('❌ No cutting master ID found');
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     const { status, page = 1, limit = 20 } = req.query;

//     // ✅ FIX: Simple filter - MongoDB handles conversion
//     const filter = { 
//       cuttingMaster: cuttingMasterId,
//       isActive: true 
//     };
    
//     console.log('🔍 Filter being applied:', filter);

//     if (status && status !== 'all' && status !== '') {
//       filter.status = status;
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name phone'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId'
//       })
//       .populate('tailor', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     console.log(`✅ Found ${works.length} works for cutting master ${cuttingMasterId}`);
    
//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get cutting master works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get works by tailor
// // @route   GET /api/works/tailor-works
// // @access  Private (Tailor only)
// export const getWorksByTailor = async (req, res) => {
//   try {
//     const tailorId = req.user?._id || req.user?.id;
    
//     if (!tailorId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     const { status, page = 1, limit = 20 } = req.query;

//     const filter = { 
//       tailor: tailorId,
//       isActive: true 
//     };
    
//     if (status && status !== 'all' && status !== '') {
//       filter.status = status;
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId measurements'
//       })
//       .populate('cuttingMaster', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get tailor works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };


// export const assignCuttingMaster = async (req, res) => {
//   try {
//     const { cuttingMasterId } = req.body;
//     const work = await Work.findById(req.params.id);

//     if (!work) {
//       return res.status(404).json({ success: false, message: 'Work not found' });
//     }

//     work.cuttingMaster = cuttingMasterId;
//     await work.save();

//     // Notify the assigned master
//     await createNotification({
//       type: 'work-assigned',
//       recipient: cuttingMasterId,
//       title: 'Work Assigned to You',
//       message: `Work ${work.workId} has been assigned to you`,
//       reference: { workId: work._id }
//     });

//     res.json({ success: true, message: 'Cutting master assigned', data: work });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
// // Helper function to generate measurement PDF (NOT exported)
// const generateMeasurementPdf = async (garment) => {
//   // TODO: Implement PDF generation
//   // For now, return a placeholder URL
//   return `https://storage.example.com/measurements/${garment.garmentId}.pdf`;
// };

// // ✅ NO EXPORT OBJECT AT THE BOTTOM - Each function is already exported with 'export' keyword






// // controllers/work.controller.js
// import Work from '../models/Work.js';
// import Order from '../models/Order.js';
// import Garment from '../models/Garment.js';
// import Notification from '../models/Notification.js';
// import { createNotification } from './notification.controller.js';

// // @desc    Create work for each garment in an order
// // @route   POST /api/works/create-from-order/:orderId
// // @access  Private (Store Keeper, Admin)
// export const createWorksFromOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     // Get order with garments
//     const order = await Order.findById(orderId)
//       .populate('garments');
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     const works = [];
    
//     // Create work for each garment
//     for (const garment of order.garments) {
//       // Generate measurement PDF (you can implement PDF generation later)
//       const measurementPdf = await generateMeasurementPdf(garment);
      
//       const work = await Work.create({
//         order: orderId,
//         garment: garment._id,
//         estimatedDelivery: garment.estimatedDelivery,
//         createdBy: req.user._id,
//         measurementPdf
//       });
      
//       works.push(work);
      
//       // Notify all cutting masters
//       await createNotification({
//         type: 'work-assigned',
//         recipient: null, // Will be sent to all cutting masters
//         title: 'New Work Assigned',
//         message: `New work created for ${garment.name}`,
//         reference: {
//           orderId: order._id,
//           workId: work._id,
//           garmentId: garment._id
//         },
//         priority: 'high'
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: `Created ${works.length} works`,
//       data: works
//     });

//   } catch (error) {
//     console.error('Create works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get all works (with filters)
// // @route   GET /api/works
// // @access  Private
// export const getWorks = async (req, res) => {
//   try {
//     const {
//       status,
//       cuttingMaster,
//       tailor,
//       orderId,
//       startDate,
//       endDate,
//       page = 1,
//       limit = 20
//     } = req.query;

//     const filter = {};

//     if (status) filter.status = status;
//     if (cuttingMaster) filter.cuttingMaster = cuttingMaster;
//     if (tailor) filter.tailor = tailor;
//     if (orderId) filter.order = orderId;

//     // Date range filter
//     if (startDate || endDate) {
//       filter.workDate = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         filter.workDate.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.workDate.$lte = end;
//       }
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate('order', 'orderId customer')
//       .populate('garment', 'name garmentId measurements')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId')
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get work by ID
// // @route   GET /api/works/:id
// // @access  Private
// export const getWorkById = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id)
//       .populate('order', 'orderId customer orderDate deliveryDate')
//       .populate('garment')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId phone')
//       .populate('createdBy', 'name');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: work
//     });

//   } catch (error) {
//     console.error('Get work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch work',
//       error: error.message
//     });
//   }
// };

// // @desc    Accept work (Cutting Master)
// // @route   PATCH /api/works/:id/accept
// // @access  Private (Cutting Master only)
// export const acceptWork = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // Check if already accepted
//     if (work.status !== 'pending') {
//       return res.status(400).json({
//         success: false,
//         message: 'Work already accepted or in progress'
//       });
//     }

//     // Update work
//     work.status = 'accepted';
//     work.cuttingMaster = req.user._id;
//     work.acceptedAt = new Date();
//     await work.save();

//     // Update order status to confirmed
//     await Order.findByIdAndUpdate(work.order._id, {
//       status: 'confirmed'
//     });

//     // Notify store keeper
//     await createNotification({
//       type: 'work-accepted',
//       recipient: work.order.createdBy,
//       title: 'Work Accepted',
//       message: `Cutting master accepted work for ${work.garment.name}`,
//       reference: {
//         orderId: work.order._id,
//         workId: work._id,
//         garmentId: work.garment._id
//       },
//       priority: 'high'
//     });

//     res.json({
//       success: true,
//       message: 'Work accepted successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('Accept work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to accept work',
//       error: error.message
//     });
//   }
// };

// // @desc    Assign tailor to work (Cutting Master)
// // @route   PATCH /api/works/:id/assign-tailor
// // @access  Private (Cutting Master only)
// export const assignTailor = async (req, res) => {
//   try {
//     const { tailorId } = req.body;
//     const work = await Work.findById(req.params.id)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // ✅ FIXED: Check if cuttingMaster exists before comparing
//     if (!work.cuttingMaster) {
//       // If no cutting master, assign the current user as cutting master
//       work.cuttingMaster = req.user._id;
//       console.log(`✅ Auto-assigned cutting master ${req.user._id} to work ${work._id}`);
//     } else if (work.cuttingMaster.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to assign tailor for this work'
//       });
//     }

//     // Update work
//     work.tailor = tailorId;
//     await work.save();

//     // ✅ FIXED: Check if notification was created successfully
//     try {
//       await createNotification({
//         type: 'tailor-assigned',
//         recipient: tailorId,
//         title: 'New Work Assigned',
//         message: `You have been assigned to work on ${work.garment.name}`,
//         reference: {
//           orderId: work.order._id,
//           workId: work._id,
//           garmentId: work.garment._id
//         },
//         priority: 'high'
//       });
//       console.log(`✅ Notification sent to tailor ${tailorId}`);
//     } catch (notifError) {
//       console.error('❌ Failed to send notification:', notifError);
//       // Don't fail the whole request if notification fails
//     }

//     res.json({
//       success: true,
//       message: 'Tailor assigned successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('❌ Assign tailor error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to assign tailor',
//       error: error.message
//     });
//   }
// };

// // @desc    Update work status (Cutting Master)
// // @route   PATCH /api/works/:id/status
// // @access  Private (Cutting Master only)
// export const updateWorkStatus = async (req, res) => {
//   console.log('\n🔄 ===== UPDATE WORK STATUS CALLED =====');
//   console.log('Request params:', req.params);
//   console.log('Request body:', req.body);
//   console.log('User:', req.user?._id || req.user?.id);
  
//   try {
//     const { status, notes } = req.body;
//     const workId = req.params.id;

//     console.log('1️⃣ Finding work with ID:', workId);
//     const work = await Work.findById(workId)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       console.log('❌ Work not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     console.log('2️⃣ Work found:', {
//       id: work._id,
//       currentStatus: work.status,
//       cuttingMaster: work.cuttingMaster,
//       hasGarment: !!work.garment,
//       hasOrder: !!work.order
//     });

//     // ✅ Check if cutting master exists before comparing
//     console.log('3️⃣ Checking authorization...');
//     if (work.cuttingMaster) {
//       console.log('   Cutting master exists:', work.cuttingMaster.toString());
//       console.log('   Current user:', req.user._id.toString());
      
//       if (work.cuttingMaster.toString() !== req.user._id.toString()) {
//         console.log('❌ Unauthorized - cutting master mismatch');
//         return res.status(403).json({
//           success: false,
//           message: 'Not authorized to update this work'
//         });
//       }
//       console.log('✅ Authorization passed');
//     } else {
//       console.log('⚠️ No cutting master assigned, auto-assigning current user');
//       work.cuttingMaster = req.user._id;
//     }

//     // Validate status
//     console.log('4️⃣ Validating status:', status);
//     const validStatuses = [
//       'pending', 'accepted', 'cutting-started', 'cutting-completed',
//       'sewing-started', 'sewing-completed', 'ironing', 'ready-to-deliver'
//     ];

//     if (!validStatuses.includes(status)) {
//       console.log('❌ Invalid status:', status);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
//     console.log('✅ Status valid');

//     // Update status and set corresponding timestamp
//     console.log('5️⃣ Updating work data...');
//     const statusUpdates = {
//       'cutting-started': { cuttingStartedAt: new Date() },
//       'cutting-completed': { cuttingCompletedAt: new Date() },
//       'sewing-started': { sewingStartedAt: new Date() },
//       'sewing-completed': { sewingCompletedAt: new Date() },
//       'ironing': { ironingAt: new Date() },
//       'ready-to-deliver': { readyAt: new Date() }
//     };

//     // Update work
//     work.status = status;
    
//     // Add timestamp if applicable
//     if (statusUpdates[status]) {
//       Object.assign(work, statusUpdates[status]);
//       console.log(`   Set timestamp for ${status}`);
//     }
    
//     // Add notes if provided
//     if (notes) {
//       if (status.includes('cutting')) {
//         work.cuttingNotes = notes;
//         console.log('   Added cutting notes');
//       } else {
//         work.tailorNotes = notes;
//         console.log('   Added tailor notes');
//       }
//     }

//     console.log('6️⃣ Saving work...');
//     await work.save();
//     console.log('✅ Work saved successfully');

//     // Try to send notification
//     console.log('7️⃣ Sending notification...');
//     try {
//       if (work.order && work.order.createdBy) {
//         await createNotification({
//           type: 'work-status-update',
//           recipient: work.order.createdBy,
//           title: 'Work Status Updated',
//           message: `${work.garment?.name || 'Garment'} is now ${status.replace(/-/g, ' ')}`,
//           reference: {
//             orderId: work.order._id,
//             workId: work._id,
//             garmentId: work.garment?._id
//           }
//         });
//         console.log('✅ Notification sent');
//       } else {
//         console.log('⚠️ Cannot send notification - missing order or createdBy');
//       }
//     } catch (notifError) {
//       console.log('⚠️ Notification failed:', notifError.message);
//       // Don't fail the request if notification fails
//     }

//     console.log('8️⃣ Sending success response');
//     console.log('🔄 ===== UPDATE WORK STATUS COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       message: 'Work status updated successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('\n❌ ===== UPDATE WORK STATUS ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     if (error.code) console.error('Error code:', error.code);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update work status',
//       error: error.message
//     });
//   }
// };

// // @desc    Delete work (Admin only)
// // @route   DELETE /api/works/:id
// // @access  Private (Admin only)
// export const deleteWork = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id);

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // Only admin can delete
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only admin can delete works'
//       });
//     }

//     await work.deleteOne();

//     res.json({
//       success: true,
//       message: 'Work deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete work',
//       error: error.message
//     });
//   }
// };

// // @desc    Get work statistics
// // @route   GET /api/works/stats
// // @access  Private (Admin, Store Keeper)
// export const getWorkStats = async (req, res) => {
//   try {
//     console.log('📊 Fetching work statistics...');
    
//     // Aggregate work statistics by status
//     const stats = await Work.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalWorks: { $sum: 1 },
//           pendingWorks: {
//             $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
//           },
//           acceptedWorks: {
//             $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
//           },
//           cuttingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-started'] }, 1, 0] }
//           },
//           cuttingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-completed'] }, 1, 0] }
//           },
//           sewingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-started'] }, 1, 0] }
//           },
//           sewingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-completed'] }, 1, 0] }
//           },
//           ironing: {
//             $sum: { $cond: [{ $eq: ['$status', 'ironing'] }, 1, 0] }
//           },
//           readyToDeliver: {
//             $sum: { $cond: [{ $eq: ['$status', 'ready-to-deliver'] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     // Get today's works
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayWorks = await Work.countDocuments({
//       createdAt: { $gte: today }
//     });

//     // Get overdue works (estimated delivery passed and not ready)
//     const overdueWorks = await Work.countDocuments({
//       estimatedDelivery: { $lt: new Date() },
//       status: { $ne: 'ready-to-deliver' }
//     });

//     const result = stats[0] || {
//       totalWorks: 0,
//       pendingWorks: 0,
//       acceptedWorks: 0,
//       cuttingStarted: 0,
//       cuttingCompleted: 0,
//       sewingStarted: 0,
//       sewingCompleted: 0,
//       ironing: 0,
//       readyToDeliver: 0
//     };

//     res.json({
//       success: true,
//       data: {
//         ...result,
//         todayWorks,
//         overdueWorks
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get work stats error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch work statistics',
//       error: error.message 
//     });
//   }
// };

// // @desc    Get works by cutting master
// // @route   GET /api/works/my-works
// // @access  Private (Cutting Master only)
// // @desc    Get works by cutting master
// // @route   GET /api/works/my-works
// // @access  Private (Cutting Master only)
// export const getWorksByCuttingMaster = async (req, res) => {
//   try {
//     // Get cutting master ID
//     const cuttingMasterId = req.user?._id || req.user?.id;
    
//     console.log('📋 Getting works for cutting master:', {
//       fromReqUser: req.user,
//       extractedId: cuttingMasterId
//     });
    
//     if (!cuttingMasterId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     const { status, page = 1, limit = 20 } = req.query;

//     // ✅ FIXED: Show ALL works assigned to this cutting master
//     // No status filter unless specifically requested
//     const filter = { 
//       cuttingMaster: cuttingMasterId,
//       isActive: true 
//     };
    
//     // Only add status filter if specifically requested (not for "all")
//     if (status && status !== 'all' && status !== '') {
//       filter.status = status;
//       console.log(`🔍 Filtering by status: ${status}`);
//     } else {
//       console.log('🔍 Showing ALL works (no status filter)');
//     }

//     console.log('🔍 Final filter:', JSON.stringify(filter));

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name phone'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId'
//       })
//       .populate('tailor', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     console.log(`✅ Found ${works.length} works for cutting master ${cuttingMasterId}`);
    
//     // Log status breakdown
//     const statusCount = {};
//     works.forEach(w => {
//       statusCount[w.status] = (statusCount[w.status] || 0) + 1;
//     });
//     console.log('📊 Status breakdown:', statusCount);

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get cutting master works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get works by tailor
// // @route   GET /api/works/tailor-works
// // @access  Private (Tailor only)
// export const getWorksByTailor = async (req, res) => {
//   try {
//     const tailorId = req.user?._id || req.user?.id;
    
//     if (!tailorId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     const { status, page = 1, limit = 20 } = req.query;

//     const filter = { 
//       tailor: tailorId,
//       isActive: true 
//     };
    
//     if (status && status !== 'all' && status !== '') {
//       filter.status = status;
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId measurements'
//       })
//       .populate('cuttingMaster', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get tailor works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // @desc    Assign cutting master to work (Admin/Store Keeper)
// // @route   PATCH /api/works/:id/assign-cutting-master
// // @access  Private (Admin, Store Keeper)
// export const assignCuttingMaster = async (req, res) => {
//   console.log('\n✂️ ===== ASSIGN CUTTING MASTER CALLED =====');
//   console.log('Work ID:', req.params.id);
//   console.log('Request body:', req.body);
  
//   try {
//     const { cuttingMasterId } = req.body;
//     const workId = req.params.id;

//     if (!cuttingMasterId) {
//       return res.status(400).json({
//         success: false,
//         message: 'cuttingMasterId is required'
//       });
//     }

//     const work = await Work.findById(workId);
//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     work.cuttingMaster = cuttingMasterId;
//     await work.save();

//     console.log(`✅ Cutting master ${cuttingMasterId} assigned to work ${workId}`);

//     // Notify the assigned master
//     await createNotification({
//       type: 'work-assigned',
//       recipient: cuttingMasterId,
//       title: 'Work Assigned to You',
//       message: `Work ${work.workId} has been assigned to you`,
//       reference: { workId: work._id }
//     });

//     res.json({ 
//       success: true, 
//       message: 'Cutting master assigned', 
//       data: work 
//     });
//   } catch (error) {
//     console.error('❌ Assign cutting master error:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

// // Helper function to generate measurement PDF (NOT exported)
// const generateMeasurementPdf = async (garment) => {
//   // TODO: Implement PDF generation
//   // For now, return a placeholder URL
//   return `https://storage.example.com/measurements/${garment.garmentId}.pdf`;
// };

// // ✅ NO EXPORT OBJECT AT THE BOTTOM - Each function is already exported with 'export' keyword


// controllers/work.controller.js
import Work from '../models/Work.js';
import Order from '../models/Order.js';
import Garment from '../models/Garment.js';
import CuttingMaster from '../models/CuttingMaster.js'; // ✅ IMPORT MISSING MODEL
import Tailor from '../models/Tailor.js';
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
      
      // ✅ OPEN POOL MODEL: Create with null cuttingMaster
      const work = await Work.create({
        order: orderId,
        garment: garment._id,
        estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000),
        createdBy: req.user._id,
        measurementPdf,
        status: 'pending',           // Waiting for acceptance
        cuttingMaster: null,          // ⭐ NOT assigned to anyone
        workId: generateWorkId(garment.name) // Add work ID generation
      });
      
      works.push(work);
    }

    // ✅ Notify ALL cutting masters about available works
    const cuttingMasters = await CuttingMaster.find({ isActive: true });
    
    for (const master of cuttingMasters) {
      try {
        await createNotification({
          type: 'work-available',        // Changed from 'work-assigned'
          recipient: master._id,
          title: '🔔 New Work Available in Pool',
          message: `${works.length} new work(s) are waiting for your acceptance. Click to view and accept.`,
          reference: {
            orderId: order._id,
            workCount: works.length,
            workIds: works.map(w => w._id)
          },
          priority: 'high'
        });
      } catch (notifError) {
        console.error(`❌ Failed to notify cutting master ${master._id}:`, notifError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${works.length} works (open for acceptance)`,
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

    const filter = { isActive: true };

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
      .populate('order', 'orderId customer deliveryDate')
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

// ===== OPEN POOL: GET WORKS FOR CUTTING MASTER DASHBOARD =====
// @desc    Get works for cutting master (shows both accepted and available)
// @route   GET /api/works/my-works
// @access  Private (Cutting Master only)
export const getWorksByCuttingMaster = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    console.log('📋 Getting works for cutting master:', {
      userId,
      role: req.user?.role
    });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }

    // ✅ OPEN POOL FILTER: Show both:
    // 1. Works already accepted by this master
    // 2. All pending works (open for acceptance by anyone)
    const filter = {
      $or: [
        { cuttingMaster: userId },                    // Already accepted by this master
        { cuttingMaster: null, status: 'pending' }    // ⭐ Open for everyone to accept
      ],
      isActive: true
    };

    console.log('🔍 Filter:', JSON.stringify(filter));

    const works = await Work.find(filter)
      .populate({
        path: 'order',
        select: 'orderId customer deliveryDate',
        populate: {
          path: 'customer',
          select: 'name phone'
        }
      })
      .populate({
        path: 'garment',
        select: 'name garmentId measurements priceRange'
      })
      .populate('tailor', 'name')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${works.length} works`);

    // ✅ Add flags to help frontend know status
    const worksWithAcceptanceInfo = works.map(work => {
      const workObj = work.toObject();
      workObj.isAcceptedByMe = work.cuttingMaster?.toString() === userId?.toString();
      workObj.isAvailable = !work.cuttingMaster && work.status === 'pending';
      workObj.canAccept = !work.cuttingMaster && work.status === 'pending';
      return workObj;
    });

    res.json({
      success: true,
      data: {
        works: worksWithAcceptanceInfo,
        total: works.length
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

// ===== OPEN POOL: ACCEPT WORK (FIRST COME FIRST SERVE) =====
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

    // ✅ Check if already accepted by someone else
    if (work.cuttingMaster) {
      return res.status(400).json({
        success: false,
        message: 'This work was already accepted by another cutting master'
      });
    }

    // ✅ Check if work is pending
    if (work.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This work is not available for acceptance (status: ${work.status})`
      });
    }

    // ✅ Assign work to this cutting master (FIRST COME FIRST SERVE)
    work.status = 'accepted';
    work.cuttingMaster = req.user._id;
    work.acceptedAt = new Date();
    await work.save();

    console.log(`✅ Work ${work._id} accepted by cutting master ${req.user._id}`);

    // ✅ Update order status if all works are accepted
    const pendingWorks = await Work.countDocuments({
      order: work.order._id,
      status: 'pending'
    });

    if (pendingWorks === 0) {
      await Order.findByIdAndUpdate(work.order._id, {
        status: 'confirmed'
      });
      console.log(`✅ Order ${work.order._id} all works accepted, status updated to confirmed`);
    }

    // ✅ Notify store keeper
    if (work.order && work.order.createdBy) {
      await createNotification({
        type: 'work-accepted',
        recipient: work.order.createdBy,
        title: '✅ Work Accepted',
        message: `Cutting master accepted work for ${work.garment.name}`,
        reference: {
          orderId: work.order._id,
          workId: work._id,
          garmentId: work.garment._id
        },
        priority: 'high'
      });
    }

    // ✅ Send confirmation to the cutting master
    await createNotification({
      type: 'work-accepted-confirmation',
      recipient: req.user._id,
      title: '✅ You Accepted a Work',
      message: `You have successfully accepted work for ${work.garment.name}`,
      reference: {
        orderId: work.order._id,
        workId: work._id
      },
      priority: 'medium'
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

    // ✅ Check if cutting master exists before comparing
    if (!work.cuttingMaster) {
      // If no cutting master, assign the current user as cutting master
      work.cuttingMaster = req.user._id;
      work.status = 'accepted';
      console.log(`✅ Auto-assigned cutting master ${req.user._id} to work ${work._id}`);
    } else if (work.cuttingMaster.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign tailor for this work'
      });
    }

    // Update work
    work.tailor = tailorId;
    await work.save();

    // ✅ Notify the assigned tailor
    try {
      await createNotification({
        type: 'tailor-assigned',
        recipient: tailorId,
        title: '📋 New Work Assigned',
        message: `You have been assigned to work on ${work.garment.name}`,
        reference: {
          orderId: work.order._id,
          workId: work._id,
          garmentId: work.garment._id
        },
        priority: 'high'
      });
      console.log(`✅ Notification sent to tailor ${tailorId}`);
    } catch (notifError) {
      console.error('❌ Failed to send notification:', notifError);
      // Don't fail the whole request if notification fails
    }

    res.json({
      success: true,
      message: 'Tailor assigned successfully',
      data: work
    });

  } catch (error) {
    console.error('❌ Assign tailor error:', error);
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
  console.log('\n🔄 ===== UPDATE WORK STATUS CALLED =====');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('User:', req.user?._id || req.user?.id);
  
  try {
    const { status, notes } = req.body;
    const workId = req.params.id;

    console.log('1️⃣ Finding work with ID:', workId);
    const work = await Work.findById(workId)
      .populate('order')
      .populate('garment');

    if (!work) {
      console.log('❌ Work not found');
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    console.log('2️⃣ Work found:', {
      id: work._id,
      currentStatus: work.status,
      cuttingMaster: work.cuttingMaster,
      hasGarment: !!work.garment,
      hasOrder: !!work.order
    });

    // ✅ Check if cutting master exists before comparing
    console.log('3️⃣ Checking authorization...');
    if (work.cuttingMaster) {
      console.log('   Cutting master exists:', work.cuttingMaster.toString());
      console.log('   Current user:', req.user._id.toString());
      
      if (work.cuttingMaster.toString() !== req.user._id.toString()) {
        console.log('❌ Unauthorized - cutting master mismatch');
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this work'
        });
      }
      console.log('✅ Authorization passed');
    } else {
      console.log('⚠️ No cutting master assigned, auto-assigning current user');
      work.cuttingMaster = req.user._id;
    }

    // Validate status
    console.log('4️⃣ Validating status:', status);
    const validStatuses = [
      'pending', 'accepted', 'cutting-started', 'cutting-completed',
      'sewing-started', 'sewing-completed', 'ironing', 'ready-to-deliver'
    ];

    if (!validStatuses.includes(status)) {
      console.log('❌ Invalid status:', status);
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    console.log('✅ Status valid');

    // Update status and set corresponding timestamp
    console.log('5️⃣ Updating work data...');
    const statusUpdates = {
      'cutting-started': { cuttingStartedAt: new Date() },
      'cutting-completed': { cuttingCompletedAt: new Date() },
      'sewing-started': { sewingStartedAt: new Date() },
      'sewing-completed': { sewingCompletedAt: new Date() },
      'ironing': { ironingAt: new Date() },
      'ready-to-deliver': { readyAt: new Date() }
    };

    // Update work
    work.status = status;
    
    // Add timestamp if applicable
    if (statusUpdates[status]) {
      Object.assign(work, statusUpdates[status]);
      console.log(`   Set timestamp for ${status}`);
    }
    
    // Add notes if provided
    if (notes) {
      if (status.includes('cutting')) {
        work.cuttingNotes = notes;
        console.log('   Added cutting notes');
      } else {
        work.tailorNotes = notes;
        console.log('   Added tailor notes');
      }
    }

    console.log('6️⃣ Saving work...');
    await work.save();
    console.log('✅ Work saved successfully');

    // Try to send notification
    console.log('7️⃣ Sending notification...');
    try {
      if (work.order && work.order.createdBy) {
        await createNotification({
          type: 'work-status-update',
          recipient: work.order.createdBy,
          title: '🔄 Work Status Updated',
          message: `${work.garment?.name || 'Garment'} is now ${status.replace(/-/g, ' ')}`,
          reference: {
            orderId: work.order._id,
            workId: work._id,
            garmentId: work.garment?._id
          }
        });
        console.log('✅ Notification sent');
      } else {
        console.log('⚠️ Cannot send notification - missing order or createdBy');
      }
    } catch (notifError) {
      console.log('⚠️ Notification failed:', notifError.message);
      // Don't fail the request if notification fails
    }

    console.log('8️⃣ Sending success response');
    console.log('🔄 ===== UPDATE WORK STATUS COMPLETED =====\n');
    
    res.json({
      success: true,
      message: 'Work status updated successfully',
      data: work
    });

  } catch (error) {
    console.error('\n❌ ===== UPDATE WORK STATUS ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.code) console.error('Error code:', error.code);
    console.error('❌ ===== ERROR END =====\n');
    
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

// @desc    Assign cutting master to work (Admin/Store Keeper)
// @route   PATCH /api/works/:id/assign-cutting-master
// @access  Private (Admin, Store Keeper)
export const assignCuttingMaster = async (req, res) => {
  console.log('\n✂️ ===== ASSIGN CUTTING MASTER CALLED =====');
  console.log('Work ID:', req.params.id);
  console.log('Request body:', req.body);
  
  try {
    const { cuttingMasterId } = req.body;
    const workId = req.params.id;

    if (!cuttingMasterId) {
      return res.status(400).json({
        success: false,
        message: 'cuttingMasterId is required'
      });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // If work is pending, assign directly
    work.cuttingMaster = cuttingMasterId;
    if (work.status === 'pending') {
      work.status = 'accepted';
      work.acceptedAt = new Date();
    }
    await work.save();

    console.log(`✅ Cutting master ${cuttingMasterId} assigned to work ${workId}`);

    // Notify the assigned master
    await createNotification({
      type: 'work-assigned',
      recipient: cuttingMasterId,
      title: '📋 Work Assigned to You',
      message: `Work ${work.workId} has been assigned to you`,
      reference: { workId: work._id }
    });

    res.json({ 
      success: true, 
      message: 'Cutting master assigned', 
      data: work 
    });
  } catch (error) {
    console.error('❌ Assign cutting master error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ===== HELPER FUNCTIONS =====

// Helper function to generate work ID
const generateWorkId = (garmentName) => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const prefix = garmentName?.substring(0, 3).toUpperCase() || 'WRK';
  return `${prefix}-${day}${month}${year}-${random}`;
};

// Helper function to generate measurement PDF (NOT exported)
const generateMeasurementPdf = async (garment) => {
  // TODO: Implement PDF generation
  // For now, return a placeholder URL
  return `https://storage.example.com/measurements/${garment.garmentId}.pdf`;
};