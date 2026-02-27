// seed/item.seed.js
import mongoose from "mongoose";
import Item from "../models/Item.js"; // ✅ Note: .js extension
import Category from "../models/Category.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

// Sample items data with price ranges
const getItems = (categoryIds) => [
  // Men's Shirts
  {
    name: "Cotton Casual Shirt",
    category: categoryIds["Men's Shirts"],
    priceRange: { min: 899, max: 1999 },
    isActive: true
  },
  {
    name: "Formal Office Shirt",
    category: categoryIds["Men's Shirts"],
    priceRange: { min: 1299, max: 2499 },
    isActive: true
  },
  {
    name: "Linen Summer Shirt",
    category: categoryIds["Men's Shirts"],
    priceRange: { min: 1499, max: 2999 },
    isActive: true
  },

  // Men's T-Shirts
  {
    name: "Basic Cotton T-Shirt",
    category: categoryIds["Men's T-Shirts"],
    priceRange: { min: 399, max: 899 },
    isActive: true
  },
  {
    name: "Graphic Printed T-Shirt",
    category: categoryIds["Men's T-Shirts"],
    priceRange: { min: 599, max: 1299 },
    isActive: true
  },
  {
    name: "Polo T-Shirt",
    category: categoryIds["Men's T-Shirts"],
    priceRange: { min: 699, max: 1499 },
    isActive: true
  },

  // Men's Jeans
  {
    name: "Slim Fit Jeans",
    category: categoryIds["Men's Jeans"],
    priceRange: { min: 1499, max: 2999 },
    isActive: true
  },
  {
    name: "Regular Fit Jeans",
    category: categoryIds["Men's Jeans"],
    priceRange: { min: 1299, max: 2499 },
    isActive: true
  },
  {
    name: "Stretchable Jeans",
    category: categoryIds["Men's Jeans"],
    priceRange: { min: 1699, max: 3499 },
    isActive: true
  },

  // Women's Kurtis
  {
    name: "Cotton Printed Kurti",
    category: categoryIds["Women's Kurtis"],
    priceRange: { min: 599, max: 1499 },
    isActive: true
  },
  {
    name: "Festival Wear Kurti",
    category: categoryIds["Women's Kurtis"],
    priceRange: { min: 1299, max: 2999 },
    isActive: true
  },

  // Women's Sarees
  {
    name: "Cotton Saree",
    category: categoryIds["Women's Sarees"],
    priceRange: { min: 999, max: 2499 },
    isActive: true
  },
  {
    name: "Silk Saree",
    category: categoryIds["Women's Sarees"],
    priceRange: { min: 2999, max: 7999 },
    isActive: true
  },

  // Kids' Wear
  {
    name: "Boys T-Shirt Set",
    category: categoryIds["Kids' Wear (Boys)"],
    priceRange: { min: 399, max: 899 },
    isActive: true
  },
  {
    name: "Girls Frock",
    category: categoryIds["Kids' Wear (Girls)"],
    priceRange: { min: 499, max: 1299 },
    isActive: true
  },

  // Footwear
  {
    name: "Casual Sneakers",
    category: categoryIds["Footwear"],
    priceRange: { min: 999, max: 2499 },
    isActive: true
  },
  {
    name: "Formal Shoes",
    category: categoryIds["Footwear"],
    priceRange: { min: 1499, max: 3999 },
    isActive: true
  },

  // Accessories
  {
    name: "Leather Wallet",
    category: categoryIds["Bags & Luggage"],
    priceRange: { min: 499, max: 1499 },
    isActive: true
  },
  {
    name: "Travel Backpack",
    category: categoryIds["Bags & Luggage"],
    priceRange: { min: 1299, max: 2999 },
    isActive: true
  }
];

// Seed function
const seedItems = async () => {
  try {
    console.log("🔍 Fetching categories...");
    
    // Get all categories
    const categories = await Category.find({});
    
    if (categories.length === 0) {
      console.log("❌ No categories found! Please seed categories first.");
      console.log("👉 Run: npm run seed:category");
      return;
    }
    
    console.log(`✅ Found ${categories.length} categories`);
    
    // Create a map of category names to IDs
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    // Check which categories are missing
    const requiredCategories = [
      "Men's Shirts", "Men's T-Shirts", "Men's Jeans",
      "Women's Kurtis", "Women's Sarees",
      "Kids' Wear (Boys)", "Kids' Wear (Girls)",
      "Footwear", "Bags & Luggage"
    ];
    
    const missingCategories = requiredCategories.filter(name => !categoryMap[name]);
    
    if (missingCategories.length > 0) {
      console.log("⚠️  Missing categories:", missingCategories.join(", "));
      console.log("Some items may not be created due to missing categories");
    }
    
    // Get items data with category IDs
    const items = getItems(categoryMap).filter(item => item.category); // Filter out items with missing categories
    
    console.log(`📦 Preparing to seed ${items.length} items...`);
    
    // Check existing items
    const existingCount = await Item.countDocuments();
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing items`);
      
      const shouldClear = process.argv.includes('--force');
      
      if (!shouldClear) {
        console.log("\n📝 Options:");
        console.log("   Use --force to clear existing items and add new ones");
        console.log("   Example: npm run seed:item -- --force");
        console.log("\n⏭️  Skipping seed operation");
        return;
      }
      
      console.log("🗑️  Clearing existing items...");
      await Item.deleteMany({});
      console.log("✅ Existing items cleared");
    }
    
    // Insert new items
    console.log("🌱 Seeding items...");
    const insertedItems = await Item.insertMany(items);
    
    console.log(`\n✅ Successfully seeded ${insertedItems.length} items!`);
    console.log("\n📋 Items seeded:");
    insertedItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name}`);
      console.log(`      Category: ${categories.find(c => c._id.equals(item.category))?.name}`);
      console.log(`      Price: ₹${item.priceRange.min} - ₹${item.priceRange.max}`);
      console.log(`      ID: ${item._id}\n`);
    });
    
    // Summary by category
    console.log("\n📊 Summary by Category:");
    const summary = {};
    insertedItems.forEach(item => {
      const catName = categories.find(c => c._id.equals(item.category))?.name || 'Unknown';
      summary[catName] = (summary[catName] || 0) + 1;
    });
    
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} items`);
    });
    
    console.log(`\n💰 Price Range Summary:`);
    const minPrice = Math.min(...insertedItems.map(i => i.priceRange.min));
    const maxPrice = Math.max(...insertedItems.map(i => i.priceRange.max));
    console.log(`   Overall Range: ₹${minPrice} - ₹${maxPrice}`);
    
  } catch (error) {
    console.error("❌ Error seeding items:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

// Run the seed function
const runSeed = async () => {
  try {
    await connectDB();
    await seedItems();
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    process.exit(0);
  }
};

runSeed();