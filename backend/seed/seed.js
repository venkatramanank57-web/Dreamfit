// backend/seed/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany();
    await Customer.deleteMany();

    // Password hash
    const hashedPassword = await bcrypt.hash("123456", 10);

    // ========== USERS ==========
    const users = [
      {
        name: "Admin User",
        email: "admin@dreamfit.com",
        password: hashedPassword,
        role: "ADMIN",
        phone: "9876543210",
        isActive: true,
        address: {
          street: "123 Admin Street",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600001"
        },
        notes: "Main system administrator"
      },
      {
        name: "Store Keeper",
        email: "store@dreamfit.com",
        password: hashedPassword,
        role: "STORE_KEEPER",
        phone: "9876543211",
        isActive: true,
        address: {
          street: "456 Store Street",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600002"
        },
        notes: "Manages store inventory"
      },
      {
        name: "John Store",
        email: "john@store.com",
        password: hashedPassword,
        role: "STORE_KEEPER",
        phone: "9876543212",
        isActive: true,
        address: {
          street: "321 Shop Road",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001"
        },
        notes: "Senior store keeper"
      },
      {
        name: "Cutting Master",
        email: "cutting@dreamfit.com",
        password: hashedPassword,
        role: "CUTTING_MASTER",
        phone: "9876543213",
        isActive: true,
        address: {
          street: "789 Cutting Street",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600003"
        },
        notes: "Handles cutting operations"
      },
      {
        name: "Mike Cutter",
        email: "mike@cutting.com",
        password: hashedPassword,
        role: "CUTTING_MASTER",
        phone: "9876543214",
        isActive: false,
        address: {
          street: "654 Cutter Lane",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001"
        },
        notes: "On leave"
      },
      {
        name: "Tailor Master",
        email: "tailor@dreamfit.com",
        password: hashedPassword,
        role: "TAILOR",
        phone: "9876543215",
        isActive: true,
        address: {
          street: "101 Tailor Street",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600004"
        },
        notes: "Expert in suit tailoring"
      },
      {
        name: "Ramesh Tailor",
        email: "ramesh@tailor.com",
        password: hashedPassword,
        role: "TAILOR",
        phone: "9876543216",
        isActive: true,
        address: {
          street: "202 Stitch Lane",
          city: "Coimbatore",
          state: "Tamil Nadu",
          pincode: "641001"
        },
        notes: "Specializes in wedding dresses"
      },
      {
        name: "Priya Stitch",
        email: "priya@tailor.com",
        password: hashedPassword,
        role: "TAILOR",
        phone: "9876543217",
        isActive: true,
        address: {
          street: "303 Design Street",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560002"
        },
        notes: "Women's wear specialist"
      }
    ];

    await User.insertMany(users);
    console.log("✅ Users seeded:", users.length);

    // ========== CUSTOMERS ==========
    const customers = [
      {
        customerId: "CUST-2024-00001", // ✅ Add customerId
        salutation: "Mr.",
        firstName: "Kumar",
        lastName: "Rajan",
        phone: "9876543218",
        whatsappNumber: "9876543218",
        email: "kumar.rajan@gmail.com",
        addressLine1: "12/3 Gandhi Street",
        addressLine2: "Near Bus Stand",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600001",
        notes: "VIP customer - prefers morning delivery",
        totalOrders: 5
      },
      {
        customerId: "CUST-2024-00002", // ✅ Add customerId
        salutation: "Mrs.",
        firstName: "Lakshmi",
        lastName: "Venkatesh",
        phone: "9876543219",
        whatsappNumber: "9876543220",
        email: "lakshmi.v@gmail.com",
        addressLine1: "45 Anna Nagar",
        addressLine2: "East",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600002",
        notes: "Regular customer - wedding season orders",
        totalOrders: 3
      },
      {
        customerId: "CUST-2024-00003", // ✅ Add customerId
        salutation: "Ms.",
        firstName: "Priya",
        lastName: "Dharshini",
        phone: "9876543221",
        whatsappNumber: "9876543221",
        email: "priya.d@gmail.com",
        addressLine1: "78 Nehru Colony",
        addressLine2: "Opposite Park",
        city: "Coimbatore",
        state: "Tamil Nadu",
        pincode: "641001",
        notes: "Prefers WhatsApp communication",
        totalOrders: 2
      },
      {
        customerId: "CUST-2024-00004", // ✅ Add customerId
        salutation: "Dr.",
        firstName: "Sundar",
        lastName: "Raman",
        phone: "9876543222",
        whatsappNumber: "9876543223",
        email: "dr.sundar@gmail.com",
        addressLine1: "34 Doctor's Colony",
        addressLine2: "Near Hospital",
        city: "Madurai",
        state: "Tamil Nadu",
        pincode: "625001",
        notes: "Doctor - requires urgent alterations",
        totalOrders: 4
      },
      {
        customerId: "CUST-2024-00005", // ✅ Add customerId
        salutation: "Mr.",
        firstName: "Rajesh",
        lastName: "Khanna",
        phone: "9876543224",
        whatsappNumber: "9876543224",
        email: "rajesh.k@gmail.com",
        addressLine1: "56 Mall Road",
        addressLine2: "2nd Floor",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        notes: "Bulk orders for corporate",
        totalOrders: 8
      },
      {
        customerId: "CUST-2024-00006", // ✅ Add customerId
        salutation: "Mrs.",
        firstName: "Anita",
        lastName: "Reddy",
        phone: "9876543225",
        whatsappNumber: "9876543226",
        email: "anita.reddy@gmail.com",
        addressLine1: "89 Jubilee Hills",
        addressLine2: "Road No 5",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500033",
        notes: "Prefers fabric from own collection",
        totalOrders: 6
      },
      {
        customerId: "CUST-2024-00007", // ✅ Add customerId
        salutation: "Mr.",
        firstName: "Arjun",
        lastName: "Singh",
        phone: "9876543227",
        whatsappNumber: "9876543227",
        email: "arjun.singh@gmail.com",
        addressLine1: "123 Brigade Road",
        addressLine2: "Near Forum Mall",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        notes: "Frequent customer - always urgent",
        totalOrders: 7
      },
      {
        customerId: "CUST-2024-00008", // ✅ Add customerId
        salutation: "Ms.",
        firstName: "Divya",
        lastName: "Nair",
        phone: "9876543228",
        whatsappNumber: "9876543229",
        email: "divya.nair@gmail.com",
        addressLine1: "67 Panampilly Nagar",
        addressLine2: "Near Avenue Center",
        city: "Kochi",
        state: "Kerala",
        pincode: "682036",
        notes: "Bridesmaid dresses order",
        totalOrders: 1
      }
    ];

    await Customer.insertMany(customers);
    console.log("✅ Customers seeded:", customers.length);

    // ========== SUMMARY ==========
    console.log("\n🌱 SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=================================");
    console.log("📊 USERS SUMMARY:");
    console.log(`   👑 Admin: 1`);
    console.log(`   🛍️ Store Keepers: 2`);
    console.log(`   ✂️ Cutting Masters: 2`);
    console.log(`   🧵 Tailors: 3`);
    console.log(`   Total Users: ${users.length}`);
    console.log("\n📊 CUSTOMERS SUMMARY:");
    console.log(`   👤 Total Customers: ${customers.length}`);
    console.log(`   ✅ Customer IDs: CUST-2024-00001 to CUST-2024-00008`);
    console.log("\n📞 SAMPLE CUSTOMERS:");
    console.log(`   • Kumar Rajan - ${customers[0].customerId}`);
    console.log(`   • Lakshmi Venkatesh - ${customers[1].customerId}`);
    console.log(`   • Priya Dharshini - ${customers[2].customerId}`);
    console.log("\n🔐 ALL PASSWORDS: 123456");
    console.log("=================================");
    
    process.exit();
  } catch (error) {
    console.error("❌ SEEDING ERROR:", error);
    process.exit(1);
  }
};

seedUsers();