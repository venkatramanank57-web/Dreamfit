import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  comment: String,
  rating: { type: Number, min: 0, max: 5 },
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { _id: false });

const performanceSchema = new mongoose.Schema({
  rating: { type: Number, min: 0, max: 5, default: 0 },
  feedback: [feedbackSchema]
}, { _id: false });

const workStatsSchema = new mongoose.Schema({
  totalAssigned: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  inProgress: { type: Number, default: 0 }
}, { _id: false });

// ✅ Generate tailorId function
async function generateTailorId() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const count = await mongoose.model("Tailor").countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  
  return `TLR${year}${month}${sequence}`;
}

const tailorSchema = new mongoose.Schema({
  // ✅ ID Fields
  tailorId: {
    type: String,
    unique: true,
    required: true 
  },
  
  // ✅ Personal Information
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // ✅ Authentication (NEW)
  password: {
    type: String,
    required: true,
    select: false // Don't return by default
  },
  
  // ✅ Address
  address: addressSchema,
  
  // ✅ Professional Info
  specialization: [String],
  experience: {
    type: Number,
    default: 0,
    min: 0,
    max: 50
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  
  // ✅ Status Management
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  leaveStatus: {
    type: String,
    enum: ["present", "leave", "half-day", "holiday"],
    default: "present",
    index: true
  },
  leaveFrom: Date,
  leaveTo: Date,
  leaveReason: String,
  
  // ✅ Work Statistics
  workStats: {
    type: workStatsSchema,
    default: () => ({})
  },
  
  // ✅ Performance
  performance: {
    type: performanceSchema,
    default: () => ({})
  },
  
  // ✅ Relationships
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  userId: { // ✅ Link to User model (NEW)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    sparse: true,
    index: true
  }
}, { 
  timestamps: true,
  validateBeforeSave: false // Allow ID generation before validation
});

// ✅ Generate tailorId before saving
tailorSchema.pre('save', async function() {
  try {
    console.log("🔧 Pre-save hook triggered");
    
    // Generate tailorId if not exists
    if (!this.tailorId) {
      console.log("📝 Generating new tailorId...");
      this.tailorId = await generateTailorId();
      console.log(`✅ Generated tailorId: ${this.tailorId}`);
    }

    // Hash password if modified
    if (this.isModified('password') && this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      console.log("🔐 Password hashed");
    }

    await this.validate();
    
  } catch (error) {
    console.error("❌ Error in pre-save hook:", error);
    throw error;
  }
});

// ✅ Method to compare password (NEW)
tailorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Indexes for performance (NEW)
tailorSchema.index({ createdAt: -1 });
tailorSchema.index({ leaveStatus: 1, isAvailable: 1 });
tailorSchema.index({ "workStats.totalAssigned": -1 });

const Tailor = mongoose.model("Tailor", tailorSchema);
console.log("✅ Tailor model registered with auth support");

export default Tailor;