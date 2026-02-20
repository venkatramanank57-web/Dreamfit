// backend/models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
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
  timestamps: true,
  // This will run before saving to maintain compatibility
  pre: {
    save: function() {
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
    }
  }
});

// Virtual for full name (optional)
customerSchema.virtual('fullName').get(function() {
  return `${this.salutation} ${this.firstName} ${this.lastName || ''}`.trim();
});

export default mongoose.model("Customer", customerSchema);