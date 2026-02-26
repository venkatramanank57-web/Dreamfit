import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    enum: ["ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"],
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  workId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Work"
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["new-work", "status-update", "ready-to-deliver", "order-completed"],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    fromRole: String,
    previousStatus: String,
    newStatus: String
  }
}, { timestamps: true });

// Index for faster queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;