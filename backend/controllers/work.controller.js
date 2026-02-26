import Work from "../models/Work.js";
import Order from "../models/Order.js";
import Garment from "../models/Garment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// ===== GET ALL WORKS (with filters) =====
export const getAllWorks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      dateRange,
      priority,
      assignedTo,
      assignedBy
    } = req.query;

    let query = { isActive: true };

    // Role-based filtering
    if (req.user.role === "CUTTING_MASTER") {
      query.assignedBy = req.user._id;
    } else if (req.user.role === "TAILOR") {
      query.assignedTo = req.user._id;
    }

    // Additional filters
    if (status && status !== "all") query.status = status;
    if (priority && priority !== "all") query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (assignedBy) query.assignedBy = assignedBy;

    // Date range filter
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let startDate = new Date();
      
      switch(dateRange) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "3m":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "6m":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "1y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      query.createdAt = { $gte: startDate };
    }

    const total = await Work.countDocuments(query);
    const works = await Work.find(query)
      .populate("order", "orderId customer deliveryDate")
      .populate("garment", "name garmentId")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get dashboard stats
    const stats = {
      total: await Work.countDocuments({ isActive: true }),
      pending: await Work.countDocuments({ isActive: true, status: "pending" }),
      accepted: await Work.countDocuments({ isActive: true, status: "accepted" }),
      inProgress: await Work.countDocuments({ 
        isActive: true, 
        status: { $in: ["cutting", "stitching", "iron"] } 
      }),
      ready: await Work.countDocuments({ isActive: true, status: "ready-to-deliver" }),
      completed: await Work.countDocuments({ isActive: true, status: "completed" })
    };

    res.json({
      works,
      stats,
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

// ===== GET WORK BY ID =====
export const getWorkById = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate("order")
      .populate("garment")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate({
        path: "order",
        populate: { path: "customer", select: "name phone customerId" }
      });

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

    // Validate status transition
    const validTransitions = {
      "pending": ["accepted"],
      "accepted": ["cutting"],
      "cutting": ["stitching"],
      "stitching": ["iron"],
      "iron": ["ready-to-deliver"],
      "ready-to-deliver": ["completed"]
    };

    if (!validTransitions[work.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${work.status} to ${status}` 
      });
    }

    // Update work
    work.status = status;
    work.timeline.push({
      status,
      updatedBy: req.user._id,
      updatedAt: new Date(),
      notes
    });
    await work.save();

    // If status is "ready-to-deliver", notify storekeeper
    if (status === "ready-to-deliver") {
      const order = await Order.findById(work.order).populate("createdBy");
      
      if (order.createdBy) {
        await Notification.create({
          userId: order.createdBy._id,
          role: "STORE_KEEPER",
          orderId: work.order,
          workId: work._id,
          message: `Work #${work.workId} is ready to deliver`,
          type: "ready-to-deliver",
          metadata: {
            fromRole: req.user.role,
            previousStatus: req.body.previousStatus || work.status,
            newStatus: status
          }
        });
      }
    }

    res.json({
      message: "Work status updated successfully",
      work
    });
  } catch (error) {
    console.error("Update work error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== ASSIGN TAILOR =====
export const assignTailor = async (req, res) => {
  try {
    const { tailorId } = req.body;
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({ message: "Work not found" });
    }

    // Check if tailor exists and has correct role
    const tailor = await User.findOne({ _id: tailorId, role: "TAILOR", isActive: true });
    if (!tailor) {
      return res.status(400).json({ message: "Invalid tailor" });
    }

    work.assignedTo = tailorId;
    work.timeline.push({
      status: "assigned-tailor",
      updatedBy: req.user._id,
      updatedAt: new Date(),
      notes: `Assigned to tailor: ${tailor.name}`
    });
    await work.save();

    // Notify tailor
    await Notification.create({
      userId: tailorId,
      role: "TAILOR",
      orderId: work.order,
      workId: work._id,
      message: `New work assigned to you: ${work.workId}`,
      type: "new-work",
      metadata: {
        fromRole: req.user.role
      }
    });

    res.json({
      message: "Tailor assigned successfully",
      work
    });
  } catch (error) {
    console.error("Assign tailor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET DASHBOARD STATS =====
export const getDashboardStats = async (req, res) => {
  try {
    const { role, _id } = req.user;
    
    let query = { isActive: true };
    
    if (role === "CUTTING_MASTER") {
      query.assignedBy = _id;
    } else if (role === "TAILOR") {
      query.assignedTo = _id;
    }

    const stats = {
      total: await Work.countDocuments(query),
      pending: await Work.countDocuments({ ...query, status: "pending" }),
      accepted: await Work.countDocuments({ ...query, status: "accepted" }),
      inProgress: await Work.countDocuments({ 
        ...query, 
        status: { $in: ["cutting", "stitching", "iron"] } 
      }),
      ready: await Work.countDocuments({ ...query, status: "ready-to-deliver" }),
      completed: await Work.countDocuments({ ...query, status: "completed" }),
      overdue: await Work.countDocuments({
        ...query,
        deliveryDate: { $lt: new Date() },
        status: { $nin: ["ready-to-deliver", "completed"] }
      })
    };

    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: error.message });
  }
};