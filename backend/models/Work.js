// models/Work.js
import mongoose from "mongoose";

const workSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  garment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Garment",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  startedAt: Date,
  completedAt: Date,
  notes: String,
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// ❌ REMOVE THIS IF IT EXISTS:
// workId: { type: String, unique: true }

const Work = mongoose.model("Work", workSchema);
export default Work;