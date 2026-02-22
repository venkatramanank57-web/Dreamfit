import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import SizeField from "../models/SizeField.js";

dotenv.config();

const sizeFields = [
  // Upper Body
  { name: "shoulder", displayName: "Shoulder", category: "upper", order: 1 },
  { name: "chest", displayName: "Chest", category: "upper", order: 2 },
  { name: "waist", displayName: "Waist", category: "upper", order: 3 },
  { name: "hip", displayName: "Hip", category: "upper", order: 4 },
  { name: "length", displayName: "Length", category: "upper", order: 5 },
  { name: "sleeveLength", displayName: "Sleeve Length", category: "upper", order: 6 },
  { name: "armhole", displayName: "Armhole", category: "upper", order: 7 },
  { name: "bicep", displayName: "Bicep", category: "upper", order: 8 },
  { name: "collar", displayName: "Collar", category: "upper", order: 9 },
  { name: "neckDepth", displayName: "Neck Depth", category: "upper", order: 10 },
  { name: "backWidth", displayName: "Back Width", category: "upper", order: 11 },
  
  // Lower Body
  { name: "thigh", displayName: "Thigh", category: "lower", order: 12 },
  { name: "knee", displayName: "Knee", category: "lower", order: 13 },
  { name: "ankle", displayName: "Ankle", category: "lower", order: 14 },
  { name: "inseam", displayName: "Inseam", category: "lower", order: 15 },
  { name: "outseam", displayName: "Outseam", category: "lower", order: 16 },
  { name: "rise", displayName: "Rise", category: "lower", order: 17 },
  
  // Full Body
  { name: "fullLength", displayName: "Full Length", category: "full", order: 18 },
  { name: "shoulderToWaist", displayName: "Shoulder to Waist", category: "full", order: 19 },
  
  // Others
  { name: "cuff", displayName: "Cuff", category: "other", order: 20 },
  { name: "hem", displayName: "Hem", category: "other", order: 21 },
  { name: "pocketWidth", displayName: "Pocket Width", category: "other", order: 22 },
  { name: "pocketHeight", displayName: "Pocket Height", category: "other", order: 23 },
];

const seedSizeFields = async () => {
  try {
    await connectDB();
    await SizeField.deleteMany();
    
    const inserted = await SizeField.insertMany(sizeFields);
    console.log(`✅ Seeded ${inserted.length} size fields`);
    
    process.exit();
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedSizeFields();