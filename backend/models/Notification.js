// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'work-assigned', 
      'work-accepted', 
      'work-status-update', 
      'order-confirmed',
      'tailor-assigned'
    ],
    required: true
  },
  
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  reference: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    workId: { type: mongoose.Schema.Types.ObjectId, ref: 'Work' },
    garmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Garment' }
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);