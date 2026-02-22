import mongoose from "mongoose";

const sizeFieldSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Shoulder", "Chest"
  isRequired: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { _id: false });

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Template name is required"],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sizeFields: [sizeFieldSchema], // Array of selected size fields
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

// Index for search
templateSchema.index({ name: 'text' });

const SizeTemplate = mongoose.model("SizeTemplate", templateSchema);
export default SizeTemplate;