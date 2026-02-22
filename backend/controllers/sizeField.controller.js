import SizeField from "../models/SizeField.js";

export const getAllSizeFields = async (req, res) => {
  try {
    const fields = await SizeField.find({ isActive: true }).sort({ order: 1, name: 1 });
    console.log(`📋 Returning ${fields.length} size fields`);
    res.json(fields);
  } catch (error) {
    console.error("❌ Get size fields error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createSizeField = async (req, res) => {
  try {
    const { name, displayName, category, unit, order } = req.body;

    const existing = await SizeField.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Size field already exists" });
    }

    const field = await SizeField.create({
      name,
      displayName,
      category: category || "other",
      unit: unit || "inches",
      order: order || 0
    });

    res.status(201).json(field);
  } catch (error) {
    console.error("❌ Create size field error:", error);
    res.status(500).json({ message: error.message });
  }
};