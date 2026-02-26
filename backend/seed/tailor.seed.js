import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Tailor from "../models/Tailor.js";
import User from "../models/User.js";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dreamfit");
    console.log("✅ MongoDB Connected for seeding");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Mock Tailor Data
const mockTailors = [
  {
    name: "Raja Kumar",
    phone: "9876543210",
    email: "raja.kumar@tailor.com",
    address: {
      street: "45 Anna Salai",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600002"
    },
    specialization: ["Shirts", "Pants"],
    experience: 8,
    joiningDate: new Date("2023-01-15"),
    isAvailable: true,
    leaveStatus: "present",
    workStats: {
      totalAssigned: 45,
      completed: 38,
      pending: 4,
      inProgress: 3
    },
    performance: {
      rating: 4.5,
      feedback: [
        {
          date: new Date("2024-01-10"),
          comment: "Excellent work on wedding suits",
          rating: 5
        },
        {
          date: new Date("2023-12-05"),
          comment: "Good quality stitching",
          rating: 4
        }
      ]
    }
  },
  {
    name: "Suresh Babu",
    phone: "9876543211",
    email: "suresh.babu@tailor.com",
    address: {
      street: "12 Gandhi Street",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641001"
    },
    specialization: ["Suits", "Blazers"],
    experience: 12,
    joiningDate: new Date("2022-06-20"),
    isAvailable: true,
    leaveStatus: "present",
    workStats: {
      totalAssigned: 67,
      completed: 58,
      pending: 5,
      inProgress: 4
    },
    performance: {
      rating: 4.8,
      feedback: [
        {
          date: new Date("2024-02-15"),
          comment: "Perfect fitting blazers",
          rating: 5
        }
      ]
    }
  },
  {
    name: "Priya Rajan",
    phone: "9876543212",
    email: "priya.rajan@tailor.com",
    address: {
      street: "78 North Street",
      city: "Madurai",
      state: "Tamil Nadu",
      pincode: "625001"
    },
    specialization: ["Bridal Wear", "Lehengas"],
    experience: 10,
    joiningDate: new Date("2022-11-10"),
    isAvailable: false,
    leaveStatus: "leave",
    leaveFrom: new Date("2024-03-01"),
    leaveTo: new Date("2024-03-07"),
    leaveReason: "Personal vacation",
    workStats: {
      totalAssigned: 52,
      completed: 45,
      pending: 5,
      inProgress: 2
    },
    performance: {
      rating: 4.9,
      feedback: [
        {
          date: new Date("2024-01-20"),
          comment: "Beautiful bridal work",
          rating: 5
        }
      ]
    }
  },
  {
    name: "Karthik Venkat",
    phone: "9876543213",
    email: "karthik.venkat@tailor.com",
    address: {
      street: "23 Lake View Road",
      city: "Ooty",
      state: "Tamil Nadu",
      pincode: "643006"
    },
    specialization: ["Kurta", "Sherwani"],
    experience: 6,
    joiningDate: new Date("2023-08-05"),
    isAvailable: true,
    leaveStatus: "present",
    workStats: {
      totalAssigned: 28,
      completed: 22,
      pending: 4,
      inProgress: 2
    },
    performance: {
      rating: 4.2,
      feedback: []
    }
  },
  {
    name: "Meena Krishnan",
    phone: "9876543214",
    email: "meena.krishnan@tailor.com",
    address: {
      street: "56 East Street",
      city: "Trichy",
      state: "Tamil Nadu",
      pincode: "620001"
    },
    specialization: ["Saree Blouse", "Churidar"],
    experience: 15,
    joiningDate: new Date("2021-03-12"),
    isAvailable: true,
    leaveStatus: "half-day",
    leaveFrom: new Date("2024-03-04"),
    leaveTo: new Date("2024-03-04"),
    leaveReason: "Personal work",
    workStats: {
      totalAssigned: 89,
      completed: 82,
      pending: 4,
      inProgress: 3
    },
    performance: {
      rating: 4.7,
      feedback: [
        {
          date: new Date("2024-02-28"),
          comment: "Excellent blouse stitching",
          rating: 5
        },
        {
          date: new Date("2024-01-15"),
          comment: "Very professional",
          rating: 4
        }
      ]
    }
  }
];

// Create user accounts for tailors
const createUserForTailor = async (tailor, tailorId) => {
  try {
    const defaultPassword = "Welcome@123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const user = await User.create({
      name: tailor.name,
      email: tailor.email,
      phone: tailor.phone,
      role: "TAILOR",
      password: hashedPassword,
      tailorId: tailorId,
      isActive: true
    });

    console.log(`✅ User account created for ${tailor.name}`);
    return user;
  } catch (error) {
    console.log(`⚠️ User account creation failed for ${tailor.name}:`, error.message);
    return null;
  }
};

// Seed Tailors
const seedTailors = async () => {
  try {
    console.log("🌱 Starting tailor seeding...");
    
    // Clear existing tailors
    await Tailor.deleteMany({});
    console.log("🗑️ Cleared existing tailors");
    
    // Clear existing tailor users
    await User.deleteMany({ role: "TAILOR" });
    console.log("🗑️ Cleared existing tailor users");

    // Create each tailor
    for (const tailorData of mockTailors) {
      try {
        // Generate tailorId automatically via pre-save hook
        const tailor = new Tailor(tailorData);
        await tailor.save();
        
        console.log(`✅ Created tailor: ${tailor.name} (${tailor.tailorId})`);
        
        // Create user account for tailor
        await createUserForTailor(tailorData, tailor._id);
        
      } catch (error) {
        console.error(`❌ Error creating tailor ${tailorData.name}:`, error.message);
      }
    }

    // Get counts
    const tailorCount = await Tailor.countDocuments();
    const userCount = await User.countDocuments({ role: "TAILOR" });
    
    console.log("\n📊 Seeding Summary:");
    console.log(`   Total Tailors: ${tailorCount}`);
    console.log(`   Tailor Users: ${userCount}`);
    console.log("✅ Tailor seeding completed!");
    
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await seedTailors();
  process.exit(0);
};

runSeeder();