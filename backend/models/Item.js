import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);