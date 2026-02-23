import Work from "../models/Work.js";
import Garment from "../models/Garment.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

// ===== CREATE WORK =====
export const createWork = async (req, res) => {
  try {
    const { order, garment, assignedTo } = req.body;

    // Check if work already exists for this garment
    const existingWork = await Work.findOne({ garment, isActive: true });
    if (existingWork) {
      return res.status(400).json({ message: "Work already exists for this garment" });
    }

    const work = await Work.create({
      order,
      garment,
      assignedTo,
      assignedBy: req.user._id,
      status: "pending",
    });

    // Update garment with workId
    await Garment.findByIdAndUpdate(garment, { workId: work._id });

    await work.populate([
      { path: "order", select: "orderId" },
      { path: "garment", select: "name garmentId" },
      { path: "assignedTo", select: "name" },
      { path: "assignedBy", select: "name" },
    ]);

    res.status(201).json({
      message: "Work created successfully",
      work
    });
  } catch (error) {
    console.error("Create work error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET ALL WORKS =====
export const getAllWorks = async (req, res) => {
  try {
    const { status, assignedTo, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const total = await Work.countDocuments(query);
    const works = await Work.find(query)
      .populate("order", "orderId customer")
      .populate("garment", "name garmentId")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      works,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get works error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET WORKS BY USER =====
export const getWorksByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    let query = { 
      assignedTo: userId,
      isActive: true 
    };

    if (status) query.status = status;

    const works = await Work.find(query)
      .populate("order", "orderId")
      .populate("garment", "name garmentId")
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });

    res.json(works);
  } catch (error) {
    console.error("Get works by user error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET WORK BY ID =====
export const getWorkById = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate({
        path: "order",
        select: "orderId customer orderDate deliveryDate status",
        populate: { path: "customer", select: "name phone customerId" }
      })
      .populate({
        path: "garment",
        select: "name garmentId measurements referenceImages status",
        populate: [
          { path: "category", select: "name" },
          { path: "item", select: "name" },
        ]
      })
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name");

    if (!work) {
      return res.status(404).json({ message: "Work not found" });
    }

    res.json(work);
  } catch (error) {
    console.error("Get work error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE WORK STATUS =====
export const updateWorkStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({ message: "Work not found" });
    }

    // Update status with timestamps
    work.status = status;
    
    if (status === "cutting" && !work.startedAt) {
      work.startedAt = new Date();
    }
    
    if (status === "completed") {
      work.completedAt = new Date();
    }

    if (notes) work.notes = notes;

    await work.save();

    // Update garment status
    if (work.garment) {
      await Garment.findByIdAndUpdate(work.garment, { status });
    }

    // Check if all garments in order are completed
    if (status === "completed") {
      const orderWorks = await Work.find({ 
        order: work.order,
        isActive: true 
      });
      
      const allCompleted = orderWorks.every(w => w.status === "completed");
      
      if (allCompleted) {
        await Order.findByIdAndUpdate(work.order, { 
          status: "delivered" 
        });
      }
    }

    await work.populate([
      { path: "order", select: "orderId" },
      { path: "garment", select: "name" },
      { path: "assignedTo", select: "name" },
    ]);

    res.json({
      message: "Work status updated successfully",
      work
    });
  } catch (error) {
    console.error("Update work status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE WORK =====
export const updateWork = async (req, res) => {
  try {
    const { assignedTo, notes } = req.body;
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({ message: "Work not found" });
    }

    if (assignedTo) work.assignedTo = assignedTo;
    if (notes) work.notes = notes;

    await work.save();

    res.json({
      message: "Work updated successfully",
      work
    });
  } catch (error) {
    console.error("Update work error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE WORK =====
export const deleteWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({ message: "Work not found" });
    }

    // Remove workId from garment
    if (work.garment) {
      await Garment.findByIdAndUpdate(work.garment, { 
        $unset: { workId: 1 } 
      });
    }

    work.isActive = false;
    await work.save();

    res.json({ message: "Work deleted successfully" });
  } catch (error) {
    console.error("Delete work error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET WORK STATS =====
export const getWorkStats = async (req, res) => {
  try {
    const totalWorks = await Work.countDocuments({ isActive: true });
    const pendingWorks = await Work.countDocuments({ status: "pending", isActive: true });
    const cuttingWorks = await Work.countDocuments({ status: "cutting", isActive: true });
    const sewingWorks = await Work.countDocuments({ status: "sewing", isActive: true });
    const completedWorks = await Work.countDocuments({ status: "completed", isActive: true });

    // Get works by user
    const worksByUser = await Work.aggregate([
      { $match: { isActive: true } },
      { $group: {
          _id: "$assignedTo",
          count: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
      }},
      { $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
      }},
      { $unwind: "$user" },
      { $project: {
          "user.name": 1,
          "user.email": 1,
          count: 1,
          pending: 1,
          completed: 1
      }}
    ]);

    res.json({
      total: totalWorks,
      pending: pendingWorks,
      cutting: cuttingWorks,
      sewing: sewingWorks,
      completed: completedWorks,
      byUser: worksByUser
    });
  } catch (error) {
    console.error("Get work stats error:", error);
    res.status(500).json({ message: error.message });
  }
};