import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
  // Note: Removed index: true from here to prevent duplicate index warnings
  workId: { 
    type: String, 
    unique: true 
  },
  
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  
  garment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Garment', 
    required: true 
  },
  
  cuttingMaster: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CuttingMaster' 
  },
  
  tailor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tailor' 
  },
  
  status: {
    type: String,
    enum: [
      'pending',
      'accepted',
      'cutting-started',
      'cutting-completed',
      'sewing-started',
      'sewing-completed',
      'ironing',
      'ready-to-deliver'
    ],
    default: 'pending'
  },
  
  estimatedDelivery: Date,
  
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  acceptedAt: Date,
  cuttingStartedAt: Date,
  cuttingCompletedAt: Date,
  sewingStartedAt: Date,
  sewingCompletedAt: Date,
  ironingAt: Date,
  readyAt: Date,
  
  cuttingNotes: String,
  tailorNotes: String,
  
  measurementPdf: String,
  
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// ✅ CORRECTED PRE-SAVE HOOK
// In modern Mongoose, if you use an async function, do NOT use 'next'
workSchema.pre('save', async function() {
  // Generate workId if not provided
  if (!this.workId) {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
    this.workId = `WRK-${day}${month}${year}-${random}`;
  }
  
  // Set timestamps for status changes
  if (this.isModified('status')) {
    const statusFields = {
      'accepted': 'acceptedAt',
      'cutting-started': 'cuttingStartedAt',
      'cutting-completed': 'cuttingCompletedAt',
      'sewing-started': 'sewingStartedAt',
      'sewing-completed': 'sewingCompletedAt',
      'ironing': 'ironingAt',
      'ready-to-deliver': 'readyAt'
    };
    
    if (statusFields[this.status]) {
      this[statusFields[this.status]] = new Date();
    }
  }
  
  // No need to call next() in an async pre-hook
});

// ✅ CENTRALIZED INDEXES (Fixes "Duplicate schema index" warning)
// Ensure no fields inside the schema have 'index: true' or 'unique: true' if defined here
workSchema.index({ workId: 1 }, { unique: true });
workSchema.index({ order: 1 });
workSchema.index({ garment: 1 });
workSchema.index({ cuttingMaster: 1 });
workSchema.index({ tailor: 1 });
workSchema.index({ status: 1 });

export default mongoose.model('Work', workSchema);