import Order from "../models/Order.js";
import Garment from "../models/Garment.js";
import Work from "../models/Work.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js"; // ✅ Add this import

// ===== CREATE ORDER =====
// ===== CREATE ORDER =====
export const createOrder = async (req, res) => {
  try {
    // Debug: Log the entire request
    console.log("🔍 REQUEST HEADERS:", req.headers);
    console.log("🔍 REQUEST USER:", req.user);
    console.log("🔍 REQUEST BODY:", JSON.stringify(req.body, null, 2));
    console.log("🔍 REQUEST BODY createdBy:", req.body.createdBy);

    const {
      customer,
      deliveryDate,
      garments,
      specialNotes,
      advancePayment,
      priceSummary,
      balanceAmount,
      createdBy,  // ← This should come from frontend
      status,
      orderDate
    } = req.body;

    // Validate required fields
    if (!customer) {
      return res.status(400).json({ message: "Customer is required" });
    }
    if (!deliveryDate) {
      return res.status(400).json({ message: "Delivery date is required" });
    }
    if (!createdBy) {
      return res.status(400).json({ message: "createdBy is required" });
    }

    // Calculate price summary from garments if not provided
    let totalMin = priceSummary?.totalMin || 0;
    let totalMax = priceSummary?.totalMax || 0;
    
    if (garments && garments.length > 0) {
      const garmentDocs = await Garment.find({ _id: { $in: garments } });
      garmentDocs.forEach(g => {
        totalMin += g.priceRange.min;
        totalMax += g.priceRange.max;
      });
    }

    const order = await Order.create({
      customer,
      deliveryDate,
      garments: garments || [],
      specialNotes,
      advancePayment: {
        amount: advancePayment?.amount || 0,
        method: advancePayment?.method || "cash",
        date: advancePayment?.date || new Date(),
      },
      priceSummary: {
        totalMin: totalMin,
        totalMax: totalMax,
      },
      balanceAmount: balanceAmount || (totalMin - (advancePayment?.amount || 0)),
      createdBy: createdBy, // ← Use createdBy from frontend
      status: status || "draft",
      orderDate: orderDate || new Date(),
    });

    console.log("✅ Order created with ID:", order._id);
    console.log("✅ Created by:", createdBy);

    // Create work items for each garment
    if (garments && garments.length > 0) {
      console.log("📝 Creating work items for garments:", garments);
      
      for (const garmentId of garments) {
        try {
          const garment = await Garment.findById(garmentId);
          if (!garment) {
            console.log("⚠️ Garment not found:", garmentId);
            continue;
          }
          
          // Find available cutting master
          const cuttingMaster = await User.findOne({ role: "CUTTING_MASTER", isActive: true });
          
          if (cuttingMaster) {
            console.log("🔪 Found cutting master:", cuttingMaster._id);
            
            // Ensure assignedBy is set correctly
            const workData = {
              order: order._id,
              garment: garmentId,
              assignedTo: cuttingMaster._id,
              assignedBy: createdBy, // ← Make sure this is not undefined
              status: "pending",
            };
            
            console.log("📝 Creating work with data:", workData);
            
            const work = await Work.create(workData);
            console.log("✅ Work created:", work._id);
          } else {
            console.log("⚠️ No cutting master found for garment:", garmentId);
          }
        } catch (workError) {
          console.error("❌ Error creating work for garment:", garmentId, workError);
        }
      }
    }

    // Populate customer data before sending response
    await order.populate({
      path: 'customer',
      select: 'name phone customerId email address'
    });

    console.log("✅ Order created:", order.orderId);
    console.log("👤 Customer:", order.customer);
    console.log("👤 Created By:", order.createdBy);

    res.status(201).json({
      message: "Order created successfully",
      order
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({ message: error.message });
  }
};
// ===== GET ALL ORDERS (with filters) =====
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      timeFilter = "all",
      startDate,
      endDate,
    } = req.query;

    let query = { isActive: true };

    // Search by order ID
    if (search) {
      query.orderId = { $regex: search, $options: 'i' };
    }

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Time filters
    const now = new Date();
    if (timeFilter === "week") {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      query.createdAt = { $gte: weekAgo };
    } else if (timeFilter === "month") {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      query.createdAt = { $gte: monthAgo };
    } else if (timeFilter === "3m") {
      const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
      query.createdAt = { $gte: threeMonthsAgo };
    } else if (timeFilter === "6m") {
      const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
      query.createdAt = { $gte: sixMonthsAgo };
    } else if (timeFilter === "9m") {
      const nineMonthsAgo = new Date(now.setMonth(now.getMonth() - 9));
      query.createdAt = { $gte: nineMonthsAgo };
    } else if (timeFilter === "1y") {
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      query.createdAt = { $gte: yearAgo };
    }

    // Custom date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate({
        path: 'customer',
        select: 'name phone customerId email address'
      })
      .populate("garments")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log(`📋 Found ${orders.length} orders`);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET ORDER BY ID =====
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'customer',
        select: 'name phone customerId email address'
      })
      .populate({
        path: "garments",
        populate: [
          { path: "category", select: "name" },
          { path: "item", select: "name" },
          { path: "measurementTemplate", select: "name" },
          { path: "workId" },
        ]
      })
      .populate("createdBy", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ Order found:", order.orderId);
    console.log("👤 Customer:", order.customer); // Debug log

    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE ORDER STATUS =====
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({
      message: "Order status updated",
      order
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE ORDER =====
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Soft delete garments and work items too
    await Garment.updateMany(
      { _id: { $in: order.garments } },
      { isActive: false }
    );

    await Work.updateMany(
      { order: order._id },
      { isActive: false }
    );

    order.isActive = false;
    await order.save();

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ message: error.message });
  }
};