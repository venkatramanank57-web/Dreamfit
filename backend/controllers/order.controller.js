import Order from "../models/Order.js";
import Garment from "../models/Garment.js";
import Work from "../models/Work.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";

// ===== 1. GET ORDER STATS (For Dashboard Filters) =====
export const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayCount, weekCount, monthCount, allTimeCount] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today }, isActive: true }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek }, isActive: true }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
      Order.countDocuments({ isActive: true })
    ]);

    const statusStats = await Order.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        total: allTimeCount,
        statusBreakdown: statusStats
      }
    });
  } catch (error) {
    console.error("❌ Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== 2. CREATE ORDER =====
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      deliveryDate,
      garments,
      specialNotes,
      advancePayment,
      priceSummary,
      status,
      orderDate
    } = req.body;

    // 🔍 DEBUG: Log the entire user object to see its structure
    console.log("🔐 REQ.USER:", req.user);
    console.log("🔐 REQ.USER._id:", req.user?._id);
    console.log("🔐 REQ.USER.id:", req.user?.id);

    // ✅ FIX: Get creatorId from multiple possible locations
    const creatorId = req.user?._id || req.user?.id;

    if (!creatorId) {
      console.error("❌ No user ID found in request. Auth middleware failed.");
      return res.status(401).json({ 
        success: false, 
        message: "Authentication failed. Please log in again." 
      });
    }

    console.log("✅ Creating order with creatorId:", creatorId);

    if (!customer || !deliveryDate) {
      return res.status(400).json({ message: "Customer and Delivery Date are required" });
    }

    // Calculate totals from garments if not provided
    let totalMin = priceSummary?.totalMin || 0;
    let totalMax = priceSummary?.totalMax || 0;
    
    if (garments && garments.length > 0) {
      const garmentDocs = await Garment.find({ _id: { $in: garments } });
      garmentDocs.forEach(g => {
        totalMin += g.priceRange?.min || 0;
        totalMax += g.priceRange?.max || 0;
      });
    }

    // Create order with creatorId from token
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
      priceSummary: { totalMin, totalMax },
      balanceAmount: totalMax - (advancePayment?.amount || 0),
      createdBy: creatorId,
      status: status || "draft",
      orderDate: orderDate || new Date(),
    });

    // Create Work entries and Notify Cutting Master
    if (garments && garments.length > 0) {
      for (const garmentId of garments) {
        const cuttingMaster = await User.findOne({ role: "CUTTING_MASTER", isActive: true });
        
        const workData = {
          order: order._id,
          garment: garmentId,
          assignedTo: cuttingMaster ? cuttingMaster._id : null,
          assignedBy: creatorId,
          status: "pending",
        };
        
        const work = await Work.create(workData);
        await Garment.findByIdAndUpdate(garmentId, { workId: work._id });
      }
    }

    await order.populate({ path: 'customer', select: 'name phone customerId' });

    res.status(201).json({ 
      success: true, 
      message: "Order created and sent to Cutting Master", 
      order 
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: "Validation failed", 
        errors 
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== 3. GET ALL ORDERS (With Period Filters) =====
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

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== "all") query.status = status;

    // 📅 Logic: Time Filters (Week, 3m, 6m, 1y)
    const now = new Date();
    if (timeFilter !== "all") {
      let filterDate = new Date();
      if (timeFilter === "week") filterDate.setDate(now.getDate() - 7);
      else if (timeFilter === "month") filterDate.setMonth(now.getMonth() - 1);
      else if (timeFilter === "3m") filterDate.setMonth(now.getMonth() - 3);
      else if (timeFilter === "6m") filterDate.setMonth(now.getMonth() - 6);
      else if (timeFilter === "1y") filterDate.setFullYear(now.getFullYear() - 1);
      
      query.createdAt = { $gte: filterDate };
    }

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name phone customerId')
      .populate("garments")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== 4. GET ORDER BY ID =====
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone customerId email address addressLine1 addressLine2 city state pincode')
      .populate({
        path: "garments",
        populate: [
          { path: "category", select: "name" },
          { path: "item", select: "name" },
          { path: "workId" }
        ]
      })
      .populate("createdBy", "name");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== 5. UPDATE ORDER (FULL UPDATE) =====
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📝 Updating order:", id);
    console.log("📦 Update data:", req.body);

    const {
      deliveryDate,
      specialNotes,
      advancePayment,
      priceSummary,
      balanceAmount,
      status
    } = req.body;

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update fields (only if provided)
    if (deliveryDate) order.deliveryDate = deliveryDate;
    if (specialNotes !== undefined) order.specialNotes = specialNotes;
    
    if (advancePayment) {
      order.advancePayment = {
        amount: advancePayment.amount !== undefined ? advancePayment.amount : order.advancePayment.amount,
        method: advancePayment.method || order.advancePayment.method,
        date: advancePayment.date || order.advancePayment.date || new Date()
      };
    }
    
    if (priceSummary) {
      order.priceSummary = {
        totalMin: priceSummary.totalMin !== undefined ? priceSummary.totalMin : order.priceSummary.totalMin,
        totalMax: priceSummary.totalMax !== undefined ? priceSummary.totalMax : order.priceSummary.totalMax
      };
    }
    
    if (balanceAmount !== undefined) order.balanceAmount = balanceAmount;
    if (status) order.status = status;

    await order.save();
    
    // Populate customer data for response
    await order.populate('customer', 'name phone customerId salutation firstName lastName');
    await order.populate('garments');

    console.log("✅ Order updated successfully:", order.orderId);
    res.json({
      success: true,
      message: "Order updated successfully",
      order
    });

  } catch (error) {
    console.error("❌ Update order error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: "Validation failed", 
        errors 
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== 6. UPDATE ORDER STATUS =====
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== 7. DELETE ORDER (Soft Delete) =====
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Soft delete garments and work
    await Garment.updateMany({ _id: { $in: order.garments } }, { isActive: false });
    await Work.updateMany({ order: order._id }, { isActive: false });

    order.isActive = false;
    await order.save();

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};