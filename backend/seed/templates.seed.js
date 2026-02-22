import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import SizeTemplate from "../models/SizeTemplate.js";

dotenv.config();

const seedTemplates = async () => {
  try {
    await connectDB();
    
    // Clear existing templates
    await SizeTemplate.deleteMany();
    console.log("🧹 Cleared existing templates");

    // Create templates
    const templates = [
      {
        name: "Men's Formal Shirt",
        description: "Standard measurements for men's formal shirts",
        sizeFields: [
          { name: "shoulder", isRequired: true },
          { name: "chest", isRequired: true },
          { name: "length", isRequired: true },
          { name: "sleeveLength", isRequired: true },
          { name: "collar", isRequired: false },
          { name: "cuff", isRequired: false },
        ],
        isActive: true
      },
      {
        name: "Women's Blouse",
        description: "Standard measurements for women's blouses",
        sizeFields: [
          { name: "shoulder", isRequired: true },
          { name: "chest", isRequired: true },
          { name: "waist", isRequired: true },
          { name: "length", isRequired: true },
          { name: "sleeveLength", isRequired: true },
          { name: "armhole", isRequired: true },
          { name: "neckDepth", isRequired: false },
        ],
        isActive: true
      },
      {
        name: "Men's Trousers",
        description: "Standard measurements for men's trousers",
        sizeFields: [
          { name: "waist", isRequired: true },
          { name: "hip", isRequired: true },
          { name: "thigh", isRequired: true },
          { name: "inseam", isRequired: true },
          { name: "outseam", isRequired: false },
          { name: "rise", isRequired: false },
          { name: "ankle", isRequired: false },
        ],
        isActive: true
      },
      {
        name: "Kurta",
        description: "Traditional Indian kurta measurements",
        sizeFields: [
          { name: "shoulder", isRequired: true },
          { name: "chest", isRequired: true },
          { name: "length", isRequired: true },
          { name: "sleeveLength", isRequired: true },
          { name: "collar", isRequired: false },
        ],
        isActive: true
      },
      {
        name: "Salwar Kameez",
        description: "Women's traditional suit",
        sizeFields: [
          { name: "shoulder", isRequired: true },
          { name: "chest", isRequired: true },
          { name: "waist", isRequired: true },
          { name: "hip", isRequired: true },
          { name: "length", isRequired: true },
          { name: "sleeveLength", isRequired: true },
        ],
        isActive: true
      }
    ];

    const inserted = await SizeTemplate.insertMany(templates);
    console.log(`✅ Created ${inserted.length} templates`);

    console.log("\n🌱 TEMPLATES SEEDING COMPLETED!");
    console.log("================================");
    console.log(`📋 Templates: ${inserted.length}`);
    console.log("================================");
    
    process.exit();
  } catch (error) {
    console.error("❌ SEEDING ERROR:", error);
    process.exit(1);
  }
};

seedTemplates();