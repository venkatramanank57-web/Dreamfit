import mongoose from "mongoose";

const sizeFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["upper", "lower", "full", "other"],
    default: "other"
  },
  unit: {
    type: String,
    default: "inches"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const SizeField = mongoose.model("SizeField", sizeFieldSchema);
export default SizeField;