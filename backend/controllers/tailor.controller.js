import Tailor from "../models/Tailor.js";
import Work from "../models/Work.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ===== CREATE TAILOR =====
// ===== CREATE TAILOR =====
export const createTailor = async (req, res) => {
  try {
    console.log("📝 Creating tailor with data:", {
      ...req.body,
      password: req.body.password ? '[PRESENT]' : '[MISSING]'
    });
    
    // ✅ FIX: Add password to destructuring
    const { name, phone, email, password, address, specialization, experience } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    
    // ✅ FIX: Validate password
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Check if phone already exists
    const existingPhone = await Tailor.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Tailor with this phone number already exists" });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Tailor.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Tailor with this email already exists" });
      }
    }

    // Generate tailorId manually (since pre-save hook might not be running)
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await Tailor.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    const tailorId = `TLR${year}${month}${sequence}`;

    // Create tailor with ALL fields
    const tailor = new Tailor({
      tailorId, // Set manually to ensure it's there
      name,
      phone,
      email: email || undefined,
      password, // Use the password from request body
      address: address || {},
      specialization: specialization || [],
      experience: experience || 0,
      createdBy: req.user?._id,
      joiningDate: new Date(),
      // Initialize other required fields
      isActive: true,
      isAvailable: true,
      leaveStatus: "present",
      workStats: {
        totalAssigned: 0,
        completed: 0,
        pending: 0,
        inProgress: 0
      },
      performance: {
        rating: 0,
        feedback: []
      }
    });

    console.log("💾 Saving tailor with ID:", tailorId);
    
    // Save to database
    await tailor.save();
    
    console.log("✅ Tailor created with ID:", tailor.tailorId);

    // Create user account with the SAME password
    let user = null;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt); // Use the provided password

      user = await User.create({
        name,
        email: email || `${phone}@tailor.dreamfit.com`,
        phone,
        role: "TAILOR",
        password: hashedPassword,
        tailorId: tailor._id,
        isActive: true
      });
      console.log("✅ User account created for tailor");
    } catch (userError) {
      console.log("⚠️ User account creation failed:", userError.message);
      // Don't fail the whole request if user creation fails
    }

    // Return success response (excluding password)
    const tailorResponse = tailor.toObject();
    delete tailorResponse.password;
    
    res.status(201).json({
      message: "Tailor created successfully",
      tailor: tailorResponse,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null
    });
  } catch (error) {
    console.error("❌ Create tailor error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists. Please use a different value.` 
      });
    }
    
    // Handle validation error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      console.error("Validation errors:", errors);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};
// ===== GET ALL TAILORS =====
export const getAllTailors = async (req, res) => {
  try {
    const { search, status, availability } = req.query;
    let query = { isActive: true };

    // Search by name, phone, email, tailorId
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { tailorId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by leave status
    if (status && status !== 'all') {
      query.leaveStatus = status;
    }

    // Filter by availability
    if (availability && availability !== 'all') {
      query.isAvailable = availability === 'available';
    }

    const tailors = await Tailor.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Get work statistics for each tailor
    for (let tailor of tailors) {
      const workStats = await Work.aggregate([
        { $match: { assignedTo: tailor._id, isActive: true } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $in: ["$status", ["pending", "accepted"]] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $in: ["$status", ["cutting", "stitching", "iron"]] }, 1, 0] } }
        }}
      ]);

      if (workStats.length > 0) {
        tailor.workStats = workStats[0];
      } else {
        tailor.workStats = { total: 0, completed: 0, pending: 0, inProgress: 0 };
      }
    }

    res.json(tailors);
  } catch (error) {
    console.error("Get all tailors error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET TAILOR BY ID =====
export const getTailorById = async (req, res) => {
  try {
    const tailor = await Tailor.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate({
        path: 'performance.feedback.from',
        select: 'name'
      });

    if (!tailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    // Get all works assigned to this tailor
    const works = await Work.find({ 
      assignedTo: tailor._id,
      isActive: true 
    })
      .populate('order', 'orderId deliveryDate')
      .populate('garment', 'name garmentId')
      .sort({ createdAt: -1 });

    // Calculate work statistics
    const workStats = {
      total: works.length,
      completed: works.filter(w => w.status === 'completed').length,
      pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
      inProgress: works.filter(w => ['cutting', 'stitching', 'iron'].includes(w.status)).length
    };

    res.json({
      tailor,
      works,
      workStats
    });
  } catch (error) {
    console.error("Get tailor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE TAILOR =====
export const updateTailor = async (req, res) => {
  try {
    const tailor = await Tailor.findById(req.params.id);

    if (!tailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    // Check permissions
    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';
    const isTailorSelf = req.user.tailorId?.toString() === tailor._id.toString();

    if (!isAdmin && !isStoreKeeper && !isTailorSelf) {
      return res.status(403).json({ message: "Not authorized to update this tailor" });
    }

    // Fields that can be updated
    const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience'];
    
    // Only admin/store keeper can update these
    if (isAdmin || isStoreKeeper) {
      updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
    }

    // Update only allowed fields
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        tailor[field] = req.body[field];
      }
    });

    await tailor.save();

    // Update corresponding user account if needed
    if (isAdmin || isStoreKeeper) {
      await User.findOneAndUpdate(
        { tailorId: tailor._id },
        { 
          name: tailor.name,
          email: tailor.email,
          phone: tailor.phone,
          isActive: tailor.isActive
        }
      );
    }

    res.json({
      message: "Tailor updated successfully",
      tailor
    });
  } catch (error) {
    console.error("Update tailor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE LEAVE STATUS =====
// ===== UPDATE LEAVE STATUS =====
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
    const tailor = await Tailor.findById(req.params.id);

    if (!tailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    // Check permissions
    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';
    const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
    const isTailorSelf = req.user.tailorId?.toString() === tailor._id.toString();

    if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isTailorSelf) {
      return res.status(403).json({ message: "Not authorized to update leave status" });
    }

    // ✅ Add validation here too (double-check)
    if (leaveFrom && leaveTo) {
      const fromDate = new Date(leaveFrom);
      const toDate = new Date(leaveTo);
      
      if (toDate < fromDate) {
        return res.status(400).json({ 
          message: "Leave to date cannot be before from date" 
        });
      }
    }

    tailor.leaveStatus = leaveStatus;
    tailor.isAvailable = leaveStatus === 'present';
    
    if (leaveFrom) tailor.leaveFrom = leaveFrom;
    if (leaveTo) tailor.leaveTo = leaveTo;
    if (leaveReason) tailor.leaveReason = leaveReason;

    await tailor.save();

    res.json({
      message: `Leave status updated to ${leaveStatus}`,
      tailor
    });
  } catch (error) {
    console.error("Update leave status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE TAILOR (soft delete) =====
export const deleteTailor = async (req, res) => {
  try {
    const tailor = await Tailor.findById(req.params.id);

    if (!tailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    // Check if tailor has active works
    const activeWorks = await Work.countDocuments({
      assignedTo: tailor._id,
      status: { $nin: ['completed', 'cancelled'] }
    });

    if (activeWorks > 0) {
      return res.status(400).json({ 
        message: `Cannot delete tailor with ${activeWorks} active works. Complete or reassign works first.` 
      });
    }

    tailor.isActive = false;
    await tailor.save();

    // Also deactivate user account
    await User.findOneAndUpdate(
      { tailorId: tailor._id },
      { isActive: false }
    );

    res.json({ message: "Tailor deleted successfully" });
  } catch (error) {
    console.error("Delete tailor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET TAILOR STATISTICS =====
export const getTailorStats = async (req, res) => {
  try {
    const stats = await Tailor.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] } },
        onLeave: { $sum: { $cond: [{ $eq: ["$leaveStatus", "leave"] }, 1, 0] } },
        present: { $sum: { $cond: [{ $eq: ["$leaveStatus", "present"] }, 1, 0] } },
        halfDay: { $sum: { $cond: [{ $eq: ["$leaveStatus", "half-day"] }, 1, 0] } },
        holiday: { $sum: { $cond: [{ $eq: ["$leaveStatus", "holiday"] }, 1, 0] } }
      }}
    ]);

    // Get work distribution
    const workDistribution = await Work.aggregate([
      { $match: { isActive: true, assignedTo: { $ne: null } } },
      { $group: {
        _id: "$assignedTo",
        count: { $sum: 1 }
      }},
      { $group: {
        _id: null,
        avgWorkPerTailor: { $avg: "$count" },
        maxWork: { $max: "$count" },
        minWork: { $min: "$count" },
        totalAssigned: { $sum: "$count" }
      }}
    ]);

    res.json({
      tailorStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
      workDistribution: workDistribution[0] || { avgWorkPerTailor: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
    });
  } catch (error) {
    console.error("Get tailor stats error:", error);
    res.status(500).json({ message: error.message });
  }
};