// backend/models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    unique: true,
    index: true,
  },
  salutation: {
    type: String,
    enum: ["Mr.", "Mrs.", "Ms.", "Dr."],
    default: "Mr."
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true
  },
  whatsappNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  addressLine1: {
    type: String,
    required: [true, "Address is required"],
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  totalOrders: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  // ✅ IMPORTANT: Allows ID generation before validation
  validateBeforeSave: false 
});

// ✅ FIXED: Modern Async Pre-save (NO 'next' parameter)
customerSchema.pre("save", async function() {
  try {
    console.log("🔧 Customer pre-save hook triggered for:", this.firstName);
    
    // 1. Generate customer ID if it doesn't exist
    if (!this.customerId) {
      const count = await mongoose.model("Customer").countDocuments();
      const year = new Date().getFullYear();
      const sequential = String(count + 1).padStart(5, "0");
      
      this.customerId = `CUST-${year}-${sequential}`;
      console.log(`✅ Generated customerId: ${this.customerId}`);
    }

    // 2. Combine name for backward compatibility
    this.name = `${this.salutation || ''} ${this.firstName || ''} ${this.lastName || ''}`.trim();
    
    // 3. Combine address for backward compatibility
    const addressParts = [
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.state,
      this.pincode
    ].filter(Boolean);
    this.address = addressParts.join(', ');

    // 4. Manually trigger validation since auto-validation is disabled
    await this.validate();

    console.log("✅ Customer pre-save completed successfully");
    
  } catch (error) {
    console.error("❌ Error in customer pre-save hook:", error);
    // In async hooks, throwing an error is the same as calling next(error)
    throw error; 
  }
});

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.salutation || ''} ${this.firstName || ''} ${this.lastName || ''}`.trim();
});

customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;