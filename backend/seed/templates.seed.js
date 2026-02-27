// seed/templates.seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js"; // ✅ Import from config
import SizeTemplate from "../models/SizeTemplate.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Template data
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
    name: "Men's Casual Shirt",
    description: "Measurements for men's casual shirts",
    sizeFields: [
      { name: "shoulder", isRequired: true },
      { name: "chest", isRequired: true },
      { name: "length", isRequired: true },
      { name: "sleeveLength", isRequired: true },
      { name: "armhole", isRequired: true },
      { name: "bicep", isRequired: false },
      { name: "collar", isRequired: false },
    ],
    isActive: true
  },
  {
    name: "Men's T-Shirt",
    description: "Standard measurements for men's t-shirts",
    sizeFields: [
      { name: "shoulder", isRequired: true },
      { name: "chest", isRequired: true },
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
    name: "Men's Jeans",
    description: "Measurements for men's jeans",
    sizeFields: [
      { name: "waist", isRequired: true },
      { name: "hip", isRequired: true },
      { name: "thigh", isRequired: true },
      { name: "inseam", isRequired: true },
      { name: "rise", isRequired: true },
      { name: "knee", isRequired: false },
      { name: "ankle", isRequired: false },
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
    name: "Women's Top",
    description: "Measurements for women's tops",
    sizeFields: [
      { name: "shoulder", isRequired: true },
      { name: "chest", isRequired: true },
      { name: "waist", isRequired: true },
      { name: "length", isRequired: true },
      { name: "sleeveLength", isRequired: false },
      { name: "armhole", isRequired: false },
    ],
    isActive: true
  },
  {
    name: "Women's Trousers",
    description: "Standard measurements for women's trousers",
    sizeFields: [
      { name: "waist", isRequired: true },
      { name: "hip", isRequired: true },
      { name: "thigh", isRequired: true },
      { name: "inseam", isRequired: true },
      { name: "rise", isRequired: true },
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
  },
  {
    name: "Churidar",
    description: "Traditional women's bottom wear",
    sizeFields: [
      { name: "waist", isRequired: true },
      { name: "hip", isRequired: true },
      { name: "thigh", isRequired: true },
      { name: "inseam", isRequired: true },
      { name: "ankle", isRequired: true },
      { name: "rise", isRequired: false },
    ],
    isActive: true
  },
  {
    name: "Kids' Shirt",
    description: "Measurements for kids' shirts",
    sizeFields: [
      { name: "shoulder", isRequired: true },
      { name: "chest", isRequired: true },
      { name: "length", isRequired: true },
      { name: "sleeveLength", isRequired: true },
    ],
    isActive: true
  },
  {
    name: "Kids' Trousers",
    description: "Measurements for kids' trousers",
    sizeFields: [
      { name: "waist", isRequired: true },
      { name: "hip", isRequired: true },
      { name: "inseam", isRequired: true },
      { name: "thigh", isRequired: false },
    ],
    isActive: true
  }
];

// Seed function
const seedTemplates = async () => {
  try {
    console.log("🔍 Checking existing size templates...");
    
    // Check if templates already exist
    const existingCount = await SizeTemplate.countDocuments();
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing templates`);
      
      const shouldClear = process.argv.includes('--force');
      
      if (!shouldClear) {
        console.log("\n📝 Options:");
        console.log("   Use --force to clear existing templates and add new ones");
        console.log("   Example: npm run seed:templates -- --force");
        console.log("\n⏭️  Skipping seed operation");
        return;
      }
      
      console.log("🗑️  Clearing existing templates...");
      await SizeTemplate.deleteMany({});
      console.log("✅ Existing templates cleared");
    }
    
    // Insert new templates
    console.log("🌱 Seeding size templates...");
    const inserted = await SizeTemplate.insertMany(templates);
    
    console.log(`\n✅ Successfully seeded ${inserted.length} size templates!`);
    console.log("\n📋 Size Templates seeded:");
    
    inserted.forEach((template, index) => {
      console.log(`\n   ${index + 1}. ${template.name}`);
      console.log(`      Description: ${template.description}`);
      console.log(`      Fields: ${template.sizeFields.length} fields`);
      console.log(`      Required Fields: ${template.sizeFields.filter(f => f.isRequired).length}`);
      console.log(`      Optional Fields: ${template.sizeFields.filter(f => !f.isRequired).length}`);
      console.log(`      ID: ${template._id}`);
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Templates: ${inserted.length}`);
    console.log(`   Total Fields across all templates: ${inserted.reduce((acc, t) => acc + t.sizeFields.length, 0)}`);
    
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

// Run the seed function
const runSeed = async () => {
  try {
    await connectDB(); // ✅ Using imported connectDB
    await seedTemplates();
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    process.exit(0);
  }
};

runSeed();