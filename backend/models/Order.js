import mongoose from "mongoose";

const advancePaymentSchema = new mongoose.Schema({
  amount: { type: Number, default: 0 },
  method: { 
    type: String, 
    enum: ["cash", "upi", "bank-transfer", "card"],
    default: "cash" 
  },
  date: { type: Date, default: Date.now },
}, { _id: false });

const priceSummarySchema = new mongoose.Schema({
  totalMin: { type: Number, default: 0 },
  totalMax: { type: Number, default: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "confirmed", "in-progress", "delivered", "cancelled"],
    default: "draft",
  },
  garments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Garment",
  }],
  specialNotes: {
    type: String,
    default: "",
  },
  priceSummary: priceSummarySchema,
  advancePayment: advancePaymentSchema,
  balanceAmount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Generate Order ID before saving - WITHOUT next parameter
orderSchema.pre('save', async function() {
  if (!this.orderId) {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    // Get count of orders today to generate sequence
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const count = await mongoose.model("Order").countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const sequence = String(count + 1).padStart(3, '0');
    this.orderId = `${day}${month}${year}-${sequence}`;
    console.log(`🆔 Generated Order ID: ${this.orderId}`);
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;