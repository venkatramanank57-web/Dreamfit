import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "accepted", "cutting", "stitching", "iron", "ready-to-deliver", "completed"]
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date, default: Date.now },
  notes: String
}, { _id: false });

const workSchema = new mongoose.Schema({
  workId: {
    type: String,
    unique: true,
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  garment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Garment",
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // Tailor
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // Cutting Master
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "cutting", "stitching", "iron", "ready-to-deliver", "completed"],
    default: "pending"
  },
  priority: {
    type: String,
    enum: ["high", "normal", "low"],
    default: "normal"
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  timeline: [timelineSchema],
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Generate Work ID before saving
workSchema.pre('save', async function(next) {
  if (!this.workId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const count = await mongoose.model("Work").countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    this.workId = `WRK${year}${month}${day}${sequence}`;
  }
  next();
});

const Work = mongoose.model("Work", workSchema);
export default Work;