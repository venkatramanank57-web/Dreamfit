import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; // Removed 'role' requirement from body

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2️⃣ Find user (Email vachu user-ah edukuvom, role-um sethu varum)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 3️⃣ Check if user active
    if (!user.isActive) {
      return res.status(403).json({ message: "User account is disabled" });
    }

    // 4️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 5️⃣ Role Logic (No manual verification needed from frontend)
    // DB-la irukura user.role-ah direct-ah eduthukalam

    // 6️⃣ Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role, // Dynamic role from Database
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 7️⃣ Send response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Redirection-ku role-ah return pandrom
      },
      token,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};