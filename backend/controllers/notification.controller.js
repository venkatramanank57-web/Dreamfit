// controllers/notification.controller.js
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Create notification (internal function)
export const createNotification = async ({
  type,
  recipient,
  title,
  message,
  reference,
  priority = 'normal'
}) => {
  console.log('\n🔔 ===== CREATE NOTIFICATION STARTED =====');
  console.log('📌 Type:', type);
  console.log('👤 Recipient:', recipient);
  console.log('📝 Title:', title);
  console.log('💬 Message:', message);
  console.log('🔗 Reference:', JSON.stringify(reference));
  console.log('⚡ Priority:', priority);
  
  try {
    // If recipient is null, send to all cutting masters
    if (!recipient) {
      console.log('🔍 No specific recipient, finding all cutting masters...');
      const cuttingMasters = await User.find({ role: 'CUTTING_MASTER' });
      
      console.log(`✅ Found ${cuttingMasters.length} cutting masters:`);
      cuttingMasters.forEach((master, index) => {
        console.log(`   ${index + 1}. ${master.name} (ID: ${master._id})`);
      });
      
      if (cuttingMasters.length === 0) {
        console.log('⚠️ No cutting masters found - notifications not sent');
        return [];
      }
      
      const notifications = cuttingMasters.map(master => ({
        type,
        recipient: master._id,
        title,
        message,
        reference,
        priority,
        isRead: false,
        createdAt: new Date()
      }));
      
      console.log(`📝 Creating ${notifications.length} notifications...`);
      const result = await Notification.insertMany(notifications);
      console.log(`✅ Successfully created ${result.length} notifications`);
      console.log('🔔 ===== CREATE NOTIFICATION COMPLETED =====\n');
      return result;
    }

    // Send to specific recipient
    console.log(`📝 Creating notification for specific recipient: ${recipient}`);
    
    // Check if recipient exists
    const recipientExists = await User.findById(recipient);
    if (!recipientExists) {
      console.log(`⚠️ Recipient not found in database: ${recipient}`);
    } else {
      console.log(`✅ Recipient found: ${recipientExists.name}`);
    }
    
    const notification = await Notification.create({
      type,
      recipient,
      title,
      message,
      reference,
      priority,
      isRead: false,
      createdAt: new Date()
    });

    console.log(`✅ Notification created successfully!`);
    console.log(`   ID: ${notification._id}`);
    console.log(`   Type: ${notification.type}`);
    console.log(`   Recipient: ${notification.recipient}`);
    console.log('🔔 ===== CREATE NOTIFICATION COMPLETED =====\n');
    return notification;
    
  } catch (error) {
    console.error('\n❌ ===== CREATE NOTIFICATION ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.code) console.error('Error code:', error.code);
    console.error('❌ ===== ERROR END =====\n');
    throw error;
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  console.log('\n🔍 ===== GET NOTIFICATIONS STARTED =====');
  console.log('👤 User ID:', req.user?._id || req.user?.id);
  console.log('👤 User Role:', req.user?.role);
  console.log('👤 User Name:', req.user?.name);
  
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    console.log('📄 Query params:', { page, limit, unreadOnly });

    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') filter.isRead = false;

    console.log('🔍 Filter:', JSON.stringify(filter));

    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log(`📊 Pagination: Skip ${skip}, Limit ${limit}`);

    // First, check total notifications in DB for this user
    const totalInDB = await Notification.countDocuments({ recipient: req.user._id });
    console.log(`📊 Total notifications in DB for user: ${totalInDB}`);

    const unreadInDB = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });
    console.log(`📊 Unread notifications in DB: ${unreadInDB}`);

    const notifications = await Notification.find(filter)
      .populate('reference.orderId', 'orderId')
      .populate('reference.workId', 'workId')
      .populate('reference.garmentId', 'name garmentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`✅ Found ${notifications.length} notifications for this page`);
    
    if (notifications.length > 0) {
      console.log('📋 Sample first notification:', {
        id: notifications[0]._id,
        type: notifications[0].type,
        title: notifications[0].title,
        read: notifications[0].isRead,
        createdAt: notifications[0].createdAt
      });
    }

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    console.log(`📊 Final counts - Total: ${total}, Unread: ${unreadCount}`);

    console.log('🔍 ===== GET NOTIFICATIONS COMPLETED =====\n');
    
    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('\n❌ ===== GET NOTIFICATIONS ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('❌ ===== ERROR END =====\n');
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = async (req, res) => {
  console.log('\n🔍 ===== GET NOTIFICATION BY ID STARTED =====');
  console.log('🔖 Notification ID:', req.params.id);
  console.log('👤 User ID:', req.user?._id || req.user?.id);
  
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('reference.orderId', 'orderId')
      .populate('reference.workId', 'workId')
      .populate('reference.garmentId', 'name garmentId');

    if (!notification) {
      console.log('❌ Notification not found');
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    console.log('✅ Notification found:', {
      id: notification._id,
      type: notification.type,
      recipient: notification.recipient,
      title: notification.title
    });

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      console.log('❌ Unauthorized access - notification belongs to different user');
      console.log(`   Notification recipient: ${notification.recipient}`);
      console.log(`   Current user: ${req.user._id}`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this notification'
      });
    }

    console.log('🔍 ===== GET NOTIFICATION BY ID COMPLETED =====\n');
    
    res.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('\n❌ ===== GET NOTIFICATION BY ID ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('❌ ===== ERROR END =====\n');
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification',
      error: error.message
    });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  console.log('\n🔢 ===== GET UNREAD COUNT STARTED =====');
  console.log('👤 User ID:', req.user?._id || req.user?.id);
  
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    console.log(`✅ Unread count: ${count}`);
    console.log('🔢 ===== GET UNREAD COUNT COMPLETED =====\n');

    res.json({
      success: true,
      data: { unreadCount: count }
    });

  } catch (error) {
    console.error('\n❌ ===== GET UNREAD COUNT ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('❌ ===== ERROR END =====\n');
    
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  console.log('\n✅ ===== MARK NOTIFICATION AS READ STARTED =====');
  console.log('🔖 Notification ID:', req.params.id);
  console.log('👤 User ID:', req.user?._id || req.user?.id);
  
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      console.log('❌ Notification not found');
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    console.log('📋 Notification found:', {
      id: notification._id,
      type: notification.type,
      recipient: notification.recipient,
      currentReadStatus: notification.isRead
    });

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      console.log('❌ Unauthorized access - notification belongs to different user');
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    notification.isRead = true;
    await notification.save();

    console.log('✅ Notification marked as read successfully');
    console.log('✅ ===== MARK AS READ COMPLETED =====\n');

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('\n❌ ===== MARK AS READ ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('❌ ===== ERROR END =====\n');
    
    res.status(500).json({
      success: false,
      message: 'Failed to mark as read',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = async (req, res) => {
  console.log('\n✅ ===== MARK ALL NOTIFICATIONS AS READ STARTED =====');
  console.log('👤 User ID:', req.user?._id || req.user?.id);
  
  try {
    // First check how many unread exist
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });
    
    console.log(`📊 Found ${unreadCount} unread notifications`);

    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read`);
    console.log('✅ ===== MARK ALL AS READ COMPLETED =====\n');

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('\n❌ ===== MARK ALL AS READ ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('❌ ===== ERROR END =====\n');
    
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  console.log('\n🗑️ ===== DELETE NOTIFICATION STARTED =====');
  console.log('🔖 Notification ID:', req.params.id);
  console.log('👤 User ID:', req.user?._id || req.user?.id);
  
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      console.log('❌ Notification not found');
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    console.log('📋 Notification to delete:', {
      id: notification._id,
      type: notification.type,
      recipient: notification.recipient
    });

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      console.log('❌ Unauthorized access - notification belongs to different user');
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await notification.deleteOne();

    console.log('✅ Notification deleted successfully');
    console.log('🗑️ ===== DELETE NOTIFICATION COMPLETED =====\n');

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('\n❌ ===== DELETE NOTIFICATION ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('❌ ===== ERROR END =====\n');
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};