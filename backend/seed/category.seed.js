// category.seed.js
import mongoose from "mongoose";
import Category from "../models/Category.js"; // Adjust path as needed
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

// Sample categories data
const categories = [
  // Men's Categories
  {
    name: "Men's Shirts",
    isActive: true
  },
  {
    name: "Men's T-Shirts",
    isActive: true
  },
  {
    name: "Men's Jeans",
    isActive: true
  },
  {
    name: "Men's Formal Pants",
    isActive: true
  },
  {
    name: "Men's Blazers & Suits",
    isActive: true
  },
  {
    name: "Men's Ethnic Wear",
    isActive: true
  },
  {
    name: "Men's Activewear",
    isActive: true
  },
  
  // Women's Categories
  {
    name: "Women's Kurtis",
    isActive: true
  },
  {
    name: "Women's Sarees",
    isActive: true
  },
  {
    name: "Women's Dresses",
    isActive: true
  },
  {
    name: "Women's Tops",
    isActive: true
  },
  {
    name: "Women's Jeans & Trousers",
    isActive: true
  },
  {
    name: "Women's Ethnic Sets",
    isActive: true
  },
  {
    name: "Women's Activewear",
    isActive: true
  },
  
  // Kids Categories
  {
    name: "Kids' Wear (Boys)",
    isActive: true
  },
  {
    name: "Kids' Wear (Girls)",
    isActive: true
  },
  {
    name: "Infants Wear",
    isActive: true
  },
  
  // Accessories & Others
  {
    name: "Footwear",
    isActive: true
  },
  {
    name: "Bags & Luggage",
    isActive: true
  },
  {
    name: "Watches & Accessories",
    isActive: true
  }
];

// Seed function
const seedCategories = async () => {
  try {
    // Clear existing categories (optional - comment out if you want to keep existing)
    console.log("🗑️  Clearing existing categories...");
    await Category.deleteMany({});
    
    // Insert new categories
    console.log("🌱 Seeding categories...");
    const insertedCategories = await Category.insertMany(categories);
    
    console.log(`✅ Successfully seeded ${insertedCategories.length} categories!`);
    console.log("\n📋 Categories seeded:");
    insertedCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (ID: ${cat._id})`);
    });
    
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the seed function
const runSeed = async () => {
  await connectDB();
  await seedCategories();
  process.exit(0);
};

runSeed();