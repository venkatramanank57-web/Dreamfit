// backend/controllers/cuttingMaster.controller.js
import CuttingMaster from "../models/CuttingMaster.js";
import Work from "../models/Work.js";
import bcrypt from "bcryptjs";

// ===== CREATE CUTTING MASTER (Admin only) =====
export const createCuttingMaster = async (req, res) => {
  try {
    console.log("📝 Creating cutting master with data:", req.body);
    
    const { name, phone, email, password, address, specialization, experience } = req.body;

    // Validate required fields
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!phone) return res.status(400).json({ message: "Phone number is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    // Check duplicates
    const existingPhone = await CuttingMaster.findOne({ phone });
    if (existingPhone) return res.status(400).json({ message: "Phone number already exists" });

    const existingEmail = await CuttingMaster.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    // Create cutting master
    const cuttingMaster = await CuttingMaster.create({
      name,
      phone,
      email,
      password,
      address: address || {},
      specialization: specialization || [],
      experience: experience || 0,
      createdBy: req.user?._id,
      joiningDate: new Date()
    });

    console.log("✅ Cutting Master created with ID:", cuttingMaster.cuttingMasterId);

    // Don't send password back
    const response = cuttingMaster.toObject();
    delete response.password;

    res.status(201).json({
      message: "Cutting Master created successfully",
      cuttingMaster: response
    });
  } catch (error) {
    console.error("❌ Create error:", error);
    handleError(error, res);
  }
};

// ===== GET ALL CUTTING MASTERS (Admin/Store Keeper) =====
export const getAllCuttingMasters = async (req, res) => {
  try {
    const { search, availability } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { cuttingMasterId: { $regex: search, $options: 'i' } }
      ];
    }

    if (availability && availability !== 'all') {
      query.isAvailable = availability === 'available';
    }

    const cuttingMasters = await CuttingMaster.find(query)
      .populate('createdBy', 'name')
      .select('-password')
      .sort({ createdAt: -1 });

    // Get work statistics
    for (let cm of cuttingMasters) {
      const workStats = await Work.aggregate([
        { $match: { assignedTo: cm._id, isActive: true } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $in: ["$status", ["pending", "accepted"]] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $in: ["$status", ["cutting", "stitching", "iron"]] }, 1, 0] } }
        }}
      ]);

      cm.workStats = workStats[0] || { total: 0, completed: 0, pending: 0, inProgress: 0 };
    }

    res.json(cuttingMasters);
  } catch (error) {
    console.error("❌ Get all error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET CUTTING MASTER BY ID =====
export const getCuttingMasterById = async (req, res) => {
  try {
    const cuttingMaster = await CuttingMaster.findById(req.params.id)
      .populate('createdBy', 'name')
      .select('-password');

    if (!cuttingMaster) {
      return res.status(404).json({ message: "Cutting Master not found" });
    }

    // Get works assigned
    const works = await Work.find({ 
      assignedTo: cuttingMaster._id,
      isActive: true 
    })
      .populate('order', 'orderId deliveryDate')
      .populate('garment', 'name garmentId')
      .sort({ createdAt: -1 });

    const workStats = {
      total: works.length,
      completed: works.filter(w => w.status === 'completed').length,
      pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
      inProgress: works.filter(w => ['cutting', 'stitching', 'iron'].includes(w.status)).length
    };

    res.json({
      cuttingMaster,
      works,
      workStats
    });
  } catch (error) {
    console.error("❌ Get by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE CUTTING MASTER =====
export const updateCuttingMaster = async (req, res) => {
  try {
    const cuttingMaster = await CuttingMaster.findById(req.params.id);

    if (!cuttingMaster) {
      return res.status(404).json({ message: "Cutting Master not found" });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';

    if (!isAdmin && !isStoreKeeper) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Fields that can be updated
    const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience', 'isActive', 'isAvailable'];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        cuttingMaster[field] = req.body[field];
      }
    });

    await cuttingMaster.save();

    const response = cuttingMaster.toObject();
    delete response.password;

    res.json({
      message: "Cutting Master updated successfully",
      cuttingMaster: response
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE CUTTING MASTER (soft delete) =====
export const deleteCuttingMaster = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Only admin can delete" });
    }

    const cuttingMaster = await CuttingMaster.findById(req.params.id);
    if (!cuttingMaster) {
      return res.status(404).json({ message: "Cutting Master not found" });
    }

    // Check active works
    const activeWorks = await Work.countDocuments({
      assignedTo: cuttingMaster._id,
      status: { $nin: ['completed', 'cancelled'] }
    });

    if (activeWorks > 0) {
      return res.status(400).json({ 
        message: `Cannot delete with ${activeWorks} active works` 
      });
    }

    cuttingMaster.isActive = false;
    await cuttingMaster.save();

    res.json({ message: "Cutting Master deleted successfully" });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET CUTTING MASTER STATS =====
export const getCuttingMasterStats = async (req, res) => {
  try {
    const stats = await CuttingMaster.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] } }
      }}
    ]);

    res.json({
      cuttingMasterStats: stats[0] || { total: 0, available: 0 }
    });
  } catch (error) {
    console.error("❌ Stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function
const handleError = (error, res) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map(e => e.message);
    return res.status(400).json({ message: "Validation failed", errors });
  }
  res.status(500).json({ message: error.message });
};