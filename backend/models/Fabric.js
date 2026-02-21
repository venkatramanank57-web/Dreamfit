import mongoose from "mongoose";

const fabricSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  color: { type: String, required: true, trim: true },
  pricePerMeter: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: null },
  imageKey: { type: String, default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Fabric", fabricSchema);