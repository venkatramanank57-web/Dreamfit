// backend/seed/productSeed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";

// Import models
import Fabric from "../models/Fabric.js";
import Category from "../models/Category.js";
import Item from "../models/Item.js";

dotenv.config();

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Check if models are properly imported
    console.log("🔍 Checking model imports:");
    console.log("   Fabric:", Fabric ? "✅" : "❌");
    console.log("   Category:", Category ? "✅" : "❌");
    console.log("   Item:", Item ? "✅" : "❌");

    if (!Fabric || !Category || !Item) {
      throw new Error("One or more models failed to import");
    }

    // Clear existing data
    await Fabric.deleteMany({});
    await Category.deleteMany({});
    await Item.deleteMany({});

    console.log("🧹 Cleared existing product data...\n");

    // ========== 1. SEED CATEGORIES ==========
    const categories = [
      { name: "Men", isActive: true },
      { name: "Women", isActive: true },
      { name: "Kids", isActive: true },
      { name: "Unisex", isActive: true },
      { name: "Traditional", isActive: true },
      { name: "Western", isActive: true },
      { name: "Ethnic", isActive: true },
      { name: "Festival", isActive: true }
    ];

    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ Seeded ${insertedCategories.length} categories`);

    // Map category names to IDs
    const menCat = insertedCategories.find(c => c.name === "Men")?._id;
    const womenCat = insertedCategories.find(c => c.name === "Women")?._id;
    const kidsCat = insertedCategories.find(c => c.name === "Kids")?._id;
    const unisexCat = insertedCategories.find(c => c.name === "Unisex")?._id;
    const traditionalCat = insertedCategories.find(c => c.name === "Traditional")?._id;
    const westernCat = insertedCategories.find(c => c.name === "Western")?._id;
    const ethnicCat = insertedCategories.find(c => c.name === "Ethnic")?._id;
    const festivalCat = insertedCategories.find(c => c.name === "Festival")?._id;

    // ========== 2. SEED FABRICS ==========
    const fabrics = [
      { name: "Cotton", color: "White", pricePerMeter: 250, imageUrl: null, imageKey: null, isActive: true },
      { name: "Cotton", color: "Blue", pricePerMeter: 260, imageUrl: null, imageKey: null, isActive: true },
      { name: "Cotton", color: "Black", pricePerMeter: 270, imageUrl: null, imageKey: null, isActive: true },
      { name: "Silk", color: "Red", pricePerMeter: 850, imageUrl: null, imageKey: null, isActive: true },
      { name: "Silk", color: "Green", pricePerMeter: 850, imageUrl: null, imageKey: null, isActive: true },
      { name: "Silk", color: "Gold", pricePerMeter: 950, imageUrl: null, imageKey: null, isActive: true },
      { name: "Linen", color: "Beige", pricePerMeter: 450, imageUrl: null, imageKey: null, isActive: true },
      { name: "Linen", color: "Grey", pricePerMeter: 460, imageUrl: null, imageKey: null, isActive: true },
      { name: "Polyester", color: "Black", pricePerMeter: 180, imageUrl: null, imageKey: null, isActive: true },
      { name: "Polyester", color: "Navy", pricePerMeter: 190, imageUrl: null, imageKey: null, isActive: true },
      { name: "Wool", color: "Grey", pricePerMeter: 1200, imageUrl: null, imageKey: null, isActive: true },
      { name: "Wool", color: "Brown", pricePerMeter: 1250, imageUrl: null, imageKey: null, isActive: true },
      { name: "Denim", color: "Blue", pricePerMeter: 550, imageUrl: null, imageKey: null, isActive: true },
      { name: "Denim", color: "Black", pricePerMeter: 580, imageUrl: null, imageKey: null, isActive: true },
      { name: "Chiffon", color: "Pink", pricePerMeter: 380, imageUrl: null, imageKey: null, isActive: true },
      { name: "Chiffon", color: "Purple", pricePerMeter: 390, imageUrl: null, imageKey: null, isActive: true },
      { name: "Velvet", color: "Burgundy", pricePerMeter: 950, imageUrl: null, imageKey: null, isActive: true },
      { name: "Velvet", color: "Emerald", pricePerMeter: 980, imageUrl: null, imageKey: null, isActive: true }
    ];

    const insertedFabrics = await Fabric.insertMany(fabrics);
    console.log(`✅ Seeded ${insertedFabrics.length} fabrics`);

    // ========== 3. SEED ITEMS ==========
    const items = [
      // Men's Items
      { name: "Shirt", category: menCat, isActive: true },
      { name: "Formal Shirt", category: menCat, isActive: true },
      { name: "Casual Shirt", category: menCat, isActive: true },
      { name: "T-Shirt", category: menCat, isActive: true },
      { name: "Jeans", category: menCat, isActive: true },
      { name: "Formal Pant", category: menCat, isActive: true },
      { name: "Kurta", category: menCat, isActive: true },
      
      // Women's Items
      { name: "Saree", category: womenCat, isActive: true },
      { name: "Blouse", category: womenCat, isActive: true },
      { name: "Gown", category: womenCat, isActive: true },
      { name: "Lehenga", category: womenCat, isActive: true },
      { name: "Kurti", category: womenCat, isActive: true },
      { name: "Salwar Suit", category: womenCat, isActive: true },
      
      // Kids Items
      { name: "Frock", category: kidsCat, isActive: true },
      { name: "Kids Shirt", category: kidsCat, isActive: true },
      { name: "Kids Kurta", category: kidsCat, isActive: true },
      
      // Unisex Items
      { name: "Hoodie", category: unisexCat, isActive: true },
      { name: "Sweater", category: unisexCat, isActive: true },
      { name: "Jacket", category: unisexCat, isActive: true }
    ];

    const insertedItems = await Item.insertMany(items);
    console.log(`✅ Seeded ${insertedItems.length} items`);

    // ========== SUMMARY ==========
    console.log("\n🌱 PRODUCT SEEDING COMPLETED SUCCESSFULLY!");
    console.log("==========================================");
    console.log(`📊 Categories: ${insertedCategories.length}`);
    console.log(`👕 Fabrics: ${insertedFabrics.length}`);
    console.log(`🧵 Items: ${insertedItems.length}`);
    console.log("==========================================\n");
    
    process.exit();
  } catch (error) {
    console.error("❌ PRODUCT SEEDING ERROR:", error);
    process.exit(1);
  }
};

seedProducts();