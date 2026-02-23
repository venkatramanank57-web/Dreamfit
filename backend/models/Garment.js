import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number },
  unit: { type: String, default: "inches" },
}, { _id: false });

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  key: { type: String },
}, { _id: false });

const garmentSchema = new mongoose.Schema({
  garmentId: {
    type: String,
    unique: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  measurementTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SizeTemplate",
  },
  measurementSource: {
    type: String,
    enum: ["customer", "manual", "template"],
    default: "template",
  },
  measurements: [measurementSchema],
  
  // Existing image fields
  referenceImages: [imageSchema], // Studio/designer reference images
  customerImages: [imageSchema],   // Customer digital images (WhatsApp/email)
  
  // NEW: Customer physical cloth images
  customerClothImages: [imageSchema], // Photos of physical cloth given by customer
  
  additionalInfo: {
    type: String,
    default: "",
  },
  estimatedDelivery: {
    type: Date,
    required: true,
  },
  priority: {
    type: String,
    enum: ["high", "normal", "low"],
    default: "normal",
  },
  priceRange: {
    min: { type: Number, required: true, default: 0 },
    max: { type: Number, required: true, default: 0 },
  },
  status: {
    type: String,
    enum: ["pending", "cutting", "sewing", "completed"],
    default: "pending",
  },
  workId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Work",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Generate Garment ID before saving
garmentSchema.pre('save', async function() {
  if (!this.garmentId) {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    const count = await mongoose.model("Garment").countDocuments();
    const sequence = String(count + 1).padStart(3, '0');
    this.garmentId = `GRM${year}${month}${day}${sequence}`;
    console.log(`🆔 Generated Garment ID: ${this.garmentId}`);
  }
});

const Garment = mongoose.model("Garment", garmentSchema);
export default Garment;