// backend/models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  // ✅ Auto-generated Customer ID
  customerId: {
    type: String,
    unique: true,
    index: true,
  },

  // Personal Information
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
  
  // Contact Information
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
  
  // Address Information
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
  
  // Additional Information
  notes: {
    type: String,
    trim: true
  },
  
  // Computed field for backward compatibility
  name: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  
  // Stats
  totalOrders: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true
});

// ✅ Pre-save middleware to generate customerId
customerSchema.pre("save", async function(next) {
  try {
    // Generate customer ID if not exists
    if (!this.customerId) {
      // Get the count of existing customers
      const count = await mongoose.model("Customer").countDocuments();
      
      // Generate ID in format: CUST-2024-00001
      const year = new Date().getFullYear();
      const sequential = String(count + 1).padStart(5, "0");
      
      // Option 1: Year-based ID (CUST-2024-00001)
      this.customerId = `CUST-${year}-${sequential}`;
      
      // Option 2: Timestamp based (CUST-1708423456789)
      // this.customerId = `CUST${Date.now()}`;
      
      // Option 3: Random alphanumeric (CUST-ABC123XYZ)
      // this.customerId = `CUST${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    // Combine name for backward compatibility
    this.name = `${this.salutation} ${this.firstName} ${this.lastName || ''}`.trim();
    
    // Combine address for backward compatibility
    const addressParts = [
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.state,
      this.pincode
    ].filter(Boolean);
    this.address = addressParts.join(', ');

    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.salutation} ${this.firstName} ${this.lastName || ''}`.trim();
});

export default mongoose.model("Customer", customerSchema);