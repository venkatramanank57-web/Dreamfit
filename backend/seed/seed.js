import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    await User.deleteMany();

    // Password-ah hash pannanum, appo thaan login logic work aagum
    const hashedPassword = await bcrypt.hash("123456", 10);

    const users = [
      {
        name: "Admin User",
        email: "admin@dreamfit.com",
        password: hashedPassword, // hashed password inga podanum
        role: "ADMIN",
        isActive: true
      },
      {
        name: "Store Keeper",
        email: "store@dreamfit.com",
        password: hashedPassword,
        role: "STORE_KEEPER",
        isActive: true
      },
      {
        name: "Cutting Master",
        email: "cutting@dreamfit.com",
        password: hashedPassword,
        role: "CUTTING_MASTER",
        isActive: true
      },
    ];

    await User.insertMany(users);

    console.log("🌱 Users seeded successfully with Hashed Passwords!");
    process.exit();
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedUsers();