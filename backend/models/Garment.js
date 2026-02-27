import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number },
  unit: { type: String, default: "inches" },
}, { _id: false });

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  key: { type: String }, // R2 key for deletion
}, { _id: false });

const garmentSchema = new mongoose.Schema({
  // ✅ Unique Garment ID (Format: GRMYYYYMMDD001)
  garmentId: {
    type: String,
    unique: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: [true, "Order reference is required"],
  },
  name: {
    type: String,
    required: [true, "Garment name is required"],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category is required"],
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: [true, "Item is required"],
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
  
  // ✅ 3-Type Image Logic for Cutting Master
  referenceImages: [imageSchema],      // Studio/Designer references
  customerImages: [imageSchema],       // WhatsApp/Email digital images
  customerClothImages: [imageSchema],  // Photos of physical cloth (CRITICAL for Cutting Master)
  
  additionalInfo: {
    type: String,
    default: "",
  },
  estimatedDelivery: {
    type: Date,
    required: [true, "Delivery date is required"],
  },
  priority: {
    type: String,
    enum: ["high", "normal", "low"],
    default: "normal",
    index: true
  },
  priceRange: {
    min: { type: Number, required: true, default: 0 },
    max: { type: Number, required: true, default: 0 },
  },
  // ✅ Sync with Cutting Master logic
  status: {
    type: String,
    enum: ["pending", "accepted", "cutting", "stitching", "ironing", "ready_to_deliver"],
    default: "pending",
    index: true
  },
  workId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Work",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { 
  timestamps: true,
  // ✅ Prevents "garmentId is required" error before it's generated
  validateBeforeSave: false 
});

// ✅ MODERN ASYNC PRE-SAVE (No 'next' parameter)
garmentSchema.pre('save', async function() {
  try {
    // 1. Generate Garment ID if not exists
    if (!this.garmentId) {
      console.log("📝 Generating new Garment ID...");
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      const count = await mongoose.model("Garment").countDocuments();
      const sequence = String(count + 1).padStart(3, '0');
      
      this.garmentId = `GRM${year}${month}${day}${sequence}`;
      console.log(`🆔 Generated Garment ID: ${this.garmentId}`);
    }

    // 2. Manual Validation
    await this.validate();
    
  } catch (error) {
    console.error("❌ Error in Garment pre-save hook:", error);
    throw error;
  }
});

// ✅ Indexes for Work Page Performance
garmentSchema.index({ garmentId: 1 });
garmentSchema.index({ order: 1 });
garmentSchema.index({ status: 1 });

const Garment = mongoose.model("Garment", garmentSchema);
export default Garment;