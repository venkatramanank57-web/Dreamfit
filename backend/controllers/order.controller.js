// // controllers/order.controller.js
// import Order from "../models/Order.js";
// import Garment from "../models/Garment.js";
// import Work from "../models/Work.js";
// import Customer from "../models/Customer.js";
// // ✅ IMPORT THE CORRECT MODELS - NOT User
// import CuttingMaster from "../models/CuttingMaster.js"; // ✅ Add this
// import Tailor from "../models/Tailor.js"; // ✅ Add this
// import StoreKeeper from "../models/StoreKeeper.js"; // ✅ Add this
// import { createNotification } from "./notification.controller.js";

// // ===== HELPER FUNCTION TO CREATE WORKS =====
// const createWorksForOrder = async (orderId, garments, creatorId) => {
//   console.log("\n🚀 ===== CREATE WORKS FOR ORDER STARTED =====");
//   console.log(`📦 Order ID: ${orderId}`);
//   console.log(`🧵 Garments to process: ${garments?.length || 0}`);
//   console.log(`👤 Creator ID: ${creatorId}`);
  
//   try {
//     const works = [];
    
//     // ✅ Find cutting masters from their specific model
//     console.log("\n🔍 Searching for cutting masters in CuttingMaster model...");
//     const cuttingMasters = await CuttingMaster.find({ isActive: true });
//     console.log(`✅ Found ${cuttingMasters.length} cutting masters:`);
//     cuttingMasters.forEach((m, i) => {
//       console.log(`   ${i+1}. ${m.name} (ID: ${m._id})`);
//     });
    
//     if (cuttingMasters.length === 0) {
//       console.log("⚠️ WARNING: No cutting masters found! Works will be created without assignment.");
//     }

//     for (let i = 0; i < garments.length; i++) {
//       const garmentId = garments[i];
//       console.log(`\n📋 Processing garment ${i+1}/${garments.length}: ${garmentId}`);
      
//       // Get garment details
//       const garment = await Garment.findById(garmentId);
//       if (!garment) {
//         console.log(`❌ Garment not found: ${garmentId}`);
//         continue;
//       }
//       console.log(`✅ Garment found: ${garment.name} (${garment.garmentId})`);
//       console.log(`   Price Range: ₹${garment.priceRange?.min} - ₹${garment.priceRange?.max}`);

//       // Generate work ID
//       const date = new Date();
//       const day = String(date.getDate()).padStart(2, '0');
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const year = date.getFullYear();
//       const workCount = await Work.countDocuments();
//       const sequential = String(workCount + 1).padStart(4, '0');
//       const garmentPrefix = garment.name?.substring(0, 4).toUpperCase() || 'WRK';
//       const workId = `${garmentPrefix}-${day}${month}${year}-${sequential}`;
//       console.log(`🔑 Generated Work ID: ${workId}`);

//       // ✅ Prepare work data
//       const workData = {
//         workId,
//         order: orderId,
//         garment: garmentId,
//         createdBy: creatorId,
//         status: "pending",
//         estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
//       };

//       // ✅ Assign to first cutting master if available
//       if (cuttingMasters.length > 0) {
//         workData.cuttingMaster = cuttingMasters[0]._id;
//         console.log(`✂️ Assigned to cutting master: ${cuttingMasters[0].name}`);
//       }

//       // Create work
//       console.log(`💾 Creating work in database...`);
//       const work = await Work.create(workData);
      
//       console.log(`✅ Work created successfully!`);
//       console.log(`   Work ID: ${work._id}`);
//       console.log(`   Status: ${work.status}`);
//       console.log(`   Cutting Master: ${work.cuttingMaster || 'Not assigned'}`);
//       console.log(`   Estimated Delivery: ${work.estimatedDelivery}`);
      
//       works.push(work);
      
//       // Update garment with work reference
//       await Garment.findByIdAndUpdate(garmentId, { workId: work._id });
//       console.log(`✅ Garment updated with work reference`);
//     }

//     // Notify all cutting masters
//     if (works.length > 0 && cuttingMasters.length > 0) {
//       console.log(`\n📢 Sending notifications to ${cuttingMasters.length} cutting masters...`);
      
//       for (const master of cuttingMasters) {
//         try {
//           await createNotification({
//             type: 'work-assigned',
//             recipient: master._id,
//             title: 'New Works Available',
//             message: `${works.length} new work(s) available for cutting`,
//             reference: {
//               orderId: orderId
//             },
//             priority: 'high'
//           });
//           console.log(`✅ Notification sent to ${master.name}`);
//         } catch (notifError) {
//           console.log(`❌ Failed to send notification to ${master.name}:`, notifError.message);
//         }
//       }
//     } else {
//       console.log(`\n⚠️ No notifications sent:`);
//       console.log(`   - Works created: ${works.length}`);
//       console.log(`   - Cutting masters: ${cuttingMasters.length}`);
//     }

//     console.log(`\n✅ ===== CREATE WORKS COMPLETED: ${works.length} works created =====\n`);
//     return { success: true, works };
//   } catch (error) {
//     console.error("\n❌ ===== ERROR CREATING WORKS =====");
//     console.error("Error details:", error);
//     console.error("Error message:", error.message);
//     console.error("Error stack:", error.stack);
//     return { success: false, error: error.message };
//   }
// };

// // ===== 1. GET ORDER STATS (For Dashboard Filters) =====
// export const getOrderStats = async (req, res) => {
//   console.log("\n📊 ===== GET ORDER STATS =====");
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const startOfWeek = new Date(today);
//     startOfWeek.setDate(today.getDate() - today.getDay());

//     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

//     const [todayCount, weekCount, monthCount, allTimeCount] = await Promise.all([
//       Order.countDocuments({ createdAt: { $gte: today }, isActive: true }),
//       Order.countDocuments({ createdAt: { $gte: startOfWeek }, isActive: true }),
//       Order.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
//       Order.countDocuments({ isActive: true })
//     ]);

//     console.log(`📈 Stats: Today: ${todayCount}, Week: ${weekCount}, Month: ${monthCount}, Total: ${allTimeCount}`);

//     const statusStats = await Order.aggregate([
//       { $match: { isActive: true } },
//       { $group: { _id: "$status", count: { $sum: 1 } } }
//     ]);

//     console.log("📊 Status breakdown:", statusStats);

//     res.status(200).json({
//       success: true,
//       stats: {
//         today: todayCount,
//         thisWeek: weekCount,
//         thisMonth: monthCount,
//         total: allTimeCount,
//         statusBreakdown: statusStats
//       }
//     });
//   } catch (error) {
//     console.error("❌ Stats Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ===== 2. CREATE ORDER =====
// export const createOrder = async (req, res) => {
//   console.log("\n🆕 ===== CREATE ORDER STARTED =====");
//   console.log("Request body:", JSON.stringify(req.body, null, 2));
  
//   try {
//     const {
//       customer,
//       deliveryDate,
//       garments,
//       specialNotes,
//       advancePayment,
//       priceSummary,
//       status,
//       orderDate
//     } = req.body;

//     // 🔍 DEBUG: Log the entire user object to see its structure
//     console.log("\n🔐 Authentication Debug:");
//     console.log("REQ.USER:", req.user);
//     console.log("REQ.USER._id:", req.user?._id);
//     console.log("REQ.USER.id:", req.user?.id);
//     console.log("REQ.USER.role:", req.user?.role);

//     // ✅ Get creatorId from multiple possible locations
//     const creatorId = req.user?._id || req.user?.id;

//     if (!creatorId) {
//       console.error("❌ No user ID found in request. Auth middleware failed.");
//       return res.status(401).json({ 
//         success: false, 
//         message: "Authentication failed. Please log in again." 
//       });
//     }

//     console.log(`✅ Creator authenticated: ID=${creatorId}, Role=${req.user?.role}`);

//     if (!customer || !deliveryDate) {
//       console.log("❌ Missing required fields:", { customer, deliveryDate });
//       return res.status(400).json({ message: "Customer and Delivery Date are required" });
//     }

//     // Generate order ID
//     const date = new Date();
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     const orderCount = await Order.countDocuments();
//     const sequential = String(orderCount + 1).padStart(3, '0');
//     const orderId = `${day}${month}${year}-${sequential}`;
//     console.log(`🔑 Generated Order ID: ${orderId}`);

//     // Calculate totals from garments if not provided
//     let totalMin = priceSummary?.totalMin || 0;
//     let totalMax = priceSummary?.totalMax || 0;
    
//     if (garments && garments.length > 0) {
//       console.log(`\n📦 Fetching ${garments.length} garment details...`);
//       const garmentDocs = await Garment.find({ _id: { $in: garments } });
//       garmentDocs.forEach(g => {
//         totalMin += g.priceRange?.min || 0;
//         totalMax += g.priceRange?.max || 0;
//         console.log(`   - ${g.name}: ₹${g.priceRange?.min} - ₹${g.priceRange?.max}`);
//       });
//     }
//     console.log(`💰 Price summary - Min: ₹${totalMin}, Max: ₹${totalMax}`);

//     // Create order
//     console.log("\n💾 Creating order in database...");
//     const order = await Order.create({
//       orderId,
//       customer,
//       deliveryDate,
//       garments: garments || [],
//       specialNotes,
//       advancePayment: {
//         amount: advancePayment?.amount || 0,
//         method: advancePayment?.method || "cash",
//         date: advancePayment?.date || new Date(),
//       },
//       priceSummary: { totalMin, totalMax },
//       balanceAmount: totalMax - (advancePayment?.amount || 0),
//       createdBy: creatorId,
//       status: status || "draft",
//       orderDate: orderDate || new Date(),
//     });

//     console.log(`✅ Order created successfully: ${order.orderId}`);
//     console.log(`   ID: ${order._id}`);
//     console.log(`   Status: ${order.status}`);

//     // ✅ AUTO-CREATE WORKS FOR EACH GARMENT
//     if (garments && garments.length > 0) {
//       console.log(`\n🔨 Auto-creating works for ${garments.length} garments...`);
//       const workResult = await createWorksForOrder(order._id, garments, creatorId);
      
//       if (workResult.success) {
//         console.log(`✅ Created ${workResult.works.length} works for order ${order.orderId}`);
        
//         // Update order status to pending (waiting for cutting master)
//         order.status = "pending";
//         await order.save();
//         console.log(`✅ Order status updated to: ${order.status}`);
//       } else {
//         console.error("❌ Failed to create works:", workResult.error);
//       }
//     } else {
//       console.log("⚠️ No garments to create works for");
//     }

//     await order.populate({ path: 'customer', select: 'name phone customerId' });
//     console.log("✅ Order populated with customer data");

//     console.log("\n✅ ===== ORDER CREATED SUCCESSFULLY =====\n");
//     res.status(201).json({ 
//       success: true, 
//       message: garments && garments.length > 0 
//         ? "Order created and sent to Cutting Master" 
//         : "Order created successfully",
//       order 
//     });
//   } catch (error) {
//     console.error("\n❌ ===== CREATE ORDER ERROR =====");
//     console.error("Error details:", error);
//     console.error("Error message:", error.message);
//     console.error("Error stack:", error.stack);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       console.error("Validation errors:", errors);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Validation failed", 
//         errors 
//       });
//     }
    
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ===== 3. GET ALL ORDERS (With Period Filters) =====
// export const getAllOrders = async (req, res) => {
//   console.log("\n📋 ===== GET ALL ORDERS =====");
//   console.log("Query params:", req.query);
  
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       status,
//       timeFilter = "all",
//       startDate,
//       endDate,
//     } = req.query;

//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { orderId: { $regex: search, $options: 'i' } },
//         { 'customer.name': { $regex: search, $options: 'i' } }
//       ];
//       console.log(`🔍 Searching for: "${search}"`);
//     }

//     if (status && status !== "all") {
//       query.status = status;
//       console.log(`📊 Filtering by status: ${status}`);
//     }

//     // 📅 Logic: Time Filters (Week, 3m, 6m, 1y)
//     const now = new Date();
//     if (timeFilter !== "all") {
//       let filterDate = new Date();
//       if (timeFilter === "week") filterDate.setDate(now.getDate() - 7);
//       else if (timeFilter === "month") filterDate.setMonth(now.getMonth() - 1);
//       else if (timeFilter === "3m") filterDate.setMonth(now.getMonth() - 3);
//       else if (timeFilter === "6m") filterDate.setMonth(now.getMonth() - 6);
//       else if (timeFilter === "1y") filterDate.setFullYear(now.getFullYear() - 1);
      
//       query.createdAt = { $gte: filterDate };
//       console.log(`📅 Time filter: ${timeFilter}, from ${filterDate}`);
//     }

//     if (startDate && endDate) {
//       query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
//       console.log(`📅 Custom date range: ${startDate} to ${endDate}`);
//     }

//     const total = await Order.countDocuments(query);
//     console.log(`📊 Total orders found: ${total}`);

//     const orders = await Order.find(query)
//       .populate('customer', 'name phone customerId')
//       .populate("garments")
//       .populate("createdBy", "name")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     console.log(`✅ Returning ${orders.length} orders (page ${page} of ${Math.ceil(total/limit)})`);

//     res.json({ 
//       success: true, 
//       orders, 
//       pagination: { 
//         page: parseInt(page), 
//         limit: parseInt(limit), 
//         total, 
//         pages: Math.ceil(total / limit) 
//       } 
//     });
//   } catch (error) {
//     console.error("❌ Get all orders error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ===== 4. GET ORDER BY ID =====
// export const getOrderById = async (req, res) => {
//   console.log(`\n🔍 ===== GET ORDER BY ID: ${req.params.id} =====`);
  
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('customer', 'name phone customerId email address addressLine1 addressLine2 city state pincode')
//       .populate({
//         path: "garments",
//         populate: [
//           { path: "category", select: "name" },
//           { path: "item", select: "name" },
//           { path: "workId" }
//         ]
//       })
//       .populate("createdBy", "name");

//     if (!order) {
//       console.log("❌ Order not found");
//       return res.status(404).json({ message: "Order not found" });
//     }

//     console.log(`✅ Order found: ${order.orderId}`);
//     console.log(`   Customer: ${order.customer?.name}`);
//     console.log(`   Garments: ${order.garments?.length || 0}`);
//     console.log(`   Status: ${order.status}`);

//     res.json({ success: true, order });
//   } catch (error) {
//     console.error("❌ Get order by ID error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ===== 5. UPDATE ORDER (FULL UPDATE) =====
// export const updateOrder = async (req, res) => {
//   console.log(`\n📝 ===== UPDATE ORDER: ${req.params.id} =====`);
//   console.log("Update data:", JSON.stringify(req.body, null, 2));
  
//   try {
//     const { id } = req.params;
//     const {
//       deliveryDate,
//       specialNotes,
//       advancePayment,
//       priceSummary,
//       balanceAmount,
//       status,
//       newGarments
//     } = req.body;

//     // Find order
//     const order = await Order.findById(id);
//     if (!order) {
//       console.log("❌ Order not found");
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     console.log(`✅ Order found: ${order.orderId}, Current status: ${order.status}`);

//     // Update fields (only if provided)
//     if (deliveryDate) {
//       order.deliveryDate = deliveryDate;
//       console.log(`📅 Updated delivery date: ${deliveryDate}`);
//     }
    
//     if (specialNotes !== undefined) {
//       order.specialNotes = specialNotes;
//       console.log(`📝 Updated special notes`);
//     }
    
//     if (advancePayment) {
//       order.advancePayment = {
//         amount: advancePayment.amount !== undefined ? advancePayment.amount : order.advancePayment.amount,
//         method: advancePayment.method || order.advancePayment.method,
//         date: advancePayment.date || order.advancePayment.date || new Date()
//       };
//       console.log(`💰 Updated advance payment: ₹${order.advancePayment.amount}`);
//     }
    
//     if (priceSummary) {
//       order.priceSummary = {
//         totalMin: priceSummary.totalMin !== undefined ? priceSummary.totalMin : order.priceSummary.totalMin,
//         totalMax: priceSummary.totalMax !== undefined ? priceSummary.totalMax : order.priceSummary.totalMax
//       };
//       console.log(`💰 Updated price summary: ₹${order.priceSummary.totalMin} - ₹${order.priceSummary.totalMax}`);
//     }
    
//     if (balanceAmount !== undefined) {
//       order.balanceAmount = balanceAmount;
//       console.log(`💰 Updated balance: ₹${balanceAmount}`);
//     }
    
//     if (status) {
//       order.status = status;
//       console.log(`🔄 Updated status: ${status}`);
//     }

//     // If new garments are added, create works for them
//     if (newGarments && newGarments.length > 0) {
//       console.log(`\n➕ Adding ${newGarments.length} new garments...`);
//       // Add new garments to existing array
//       order.garments = [...order.garments, ...newGarments];
      
//       // Create works for new garments
//       const creatorId = req.user?._id || req.user?.id;
//       console.log(`🔨 Creating works for new garments...`);
//       const workResult = await createWorksForOrder(order._id, newGarments, creatorId);
      
//       if (workResult.success) {
//         console.log(`✅ Created ${workResult.works.length} works for new garments`);
//       } else {
//         console.error("❌ Failed to create works for new garments:", workResult.error);
//       }
//     }

//     await order.save();
//     console.log("✅ Order saved successfully");
    
//     // Populate customer data for response
//     await order.populate('customer', 'name phone customerId salutation firstName lastName');
//     await order.populate('garments');

//     console.log("✅ Order updated successfully");
//     res.json({
//       success: true,
//       message: "Order updated successfully",
//       order
//     });

//   } catch (error) {
//     console.error("❌ Update order error:", error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Validation failed", 
//         errors 
//       });
//     }
    
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ===== 6. UPDATE ORDER STATUS =====
// export const updateOrderStatus = async (req, res) => {
//   console.log(`\n🔄 ===== UPDATE ORDER STATUS: ${req.params.id} =====`);
//   console.log("New status:", req.body.status);
  
//   try {
//     const { status } = req.body;
//     const order = await Order.findByIdAndUpdate(
//       req.params.id, 
//       { status }, 
//       { new: true, runValidators: true }
//     );

//     if (!order) {
//       console.log("❌ Order not found");
//       return res.status(404).json({ message: "Order not found" });
//     }

//     console.log(`✅ Order status updated to: ${status}`);
//     res.json({ success: true, message: "Order status updated", order });
//   } catch (error) {
//     console.error("❌ Update order status error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ===== 7. DELETE ORDER (Soft Delete) =====
// export const deleteOrder = async (req, res) => {
//   console.log(`\n🗑️ ===== DELETE ORDER: ${req.params.id} =====`);
  
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       console.log("❌ Order not found");
//       return res.status(404).json({ message: "Order not found" });
//     }

//     console.log(`✅ Order found: ${order.orderId}, Soft deleting...`);

//     // Soft delete garments and work
//     const garmentResult = await Garment.updateMany({ _id: { $in: order.garments } }, { isActive: false });
//     const workResult = await Work.updateMany({ order: order._id }, { isActive: false });

//     console.log(`📦 Garments soft deleted: ${garmentResult.modifiedCount}`);
//     console.log(`⚙️ Works soft deleted: ${workResult.modifiedCount}`);

//     order.isActive = false;
//     await order.save();

//     console.log("✅ Order deleted successfully");
//     res.json({ success: true, message: "Order deleted successfully" });
//   } catch (error) {
//     console.error("❌ Delete order error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };








// controllers/order.controller.js
import Order from "../models/Order.js";
import Garment from "../models/Garment.js";
import Work from "../models/Work.js";
import Customer from "../models/Customer.js";
// ✅ IMPORT THE CORRECT MODELS - NOT User
import CuttingMaster from "../models/CuttingMaster.js"; // ✅ Add this
import Tailor from "../models/Tailor.js"; // ✅ Add this
import StoreKeeper from "../models/StoreKeeper.js"; // ✅ Add this
import { createNotification } from "./notification.controller.js";

// ===== HELPER FUNCTION TO CREATE WORKS (OPEN POOL MODEL) =====
const createWorksForOrder = async (orderId, garments, creatorId) => {
  console.log("\n🚀 ===== CREATE WORKS FOR ORDER STARTED (OPEN POOL MODEL) =====");
  console.log(`📦 Order ID: ${orderId}`);
  console.log(`🧵 Garments to process: ${garments?.length || 0}`);
  console.log(`👤 Creator ID: ${creatorId}`);
  
  try {
    const works = [];
    
    // ✅ Find ALL active cutting masters (for notifications only - NO AUTO ASSIGN)
    console.log("\n🔍 Searching for cutting masters in CuttingMaster model...");
    const cuttingMasters = await CuttingMaster.find({ isActive: true });
    console.log(`✅ Found ${cuttingMasters.length} cutting masters:`);
    cuttingMasters.forEach((m, i) => {
      console.log(`   ${i+1}. ${m.name} (ID: ${m._id})`);
    });
    
    if (cuttingMasters.length === 0) {
      console.log("⚠️ WARNING: No cutting masters found! Works will be created but no one will get notifications.");
    }

    for (let i = 0; i < garments.length; i++) {
      const garmentId = garments[i];
      console.log(`\n📋 Processing garment ${i+1}/${garments.length}: ${garmentId}`);
      
      // Get garment details
      const garment = await Garment.findById(garmentId);
      if (!garment) {
        console.log(`❌ Garment not found: ${garmentId}`);
        continue;
      }
      console.log(`✅ Garment found: ${garment.name} (${garment.garmentId})`);
      console.log(`   Price Range: ₹${garment.priceRange?.min} - ₹${garment.priceRange?.max}`);

      // Generate work ID
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const workCount = await Work.countDocuments();
      const sequential = String(workCount + 1).padStart(4, '0');
      const garmentPrefix = garment.name?.substring(0, 4).toUpperCase() || 'WRK';
      const workId = `${garmentPrefix}-${day}${month}${year}-${sequential}`;
      console.log(`🔑 Generated Work ID: ${workId}`);

      // ✅ OPEN POOL MODEL: Create work with NO assignment (cuttingMaster = null)
      // ✅ Status = 'pending' (waiting for someone to accept)
      // ✅ NO AUTO-ASSIGNMENT - Open for all cutting masters to accept
      const workData = {
        workId,
        order: orderId,
        garment: garmentId,
        createdBy: creatorId,
        status: "pending",           // Waiting for acceptance
        cuttingMaster: null,          // ⭐ CRITICAL: NOT assigned to anyone yet
        estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
      };

      // Create work
      console.log(`💾 Creating work in database (OPEN POOL)...`);
      const work = await Work.create(workData);
      
      console.log(`✅ Work created successfully!`);
      console.log(`   Work ID: ${work._id}`);
      console.log(`   Status: ${work.status} (waiting for acceptance)`);
      console.log(`   Cutting Master: NOT ASSIGNED (open for all to accept)`);
      console.log(`   Estimated Delivery: ${work.estimatedDelivery}`);
      
      works.push(work);
      
      // Update garment with work reference
      await Garment.findByIdAndUpdate(garmentId, { workId: work._id });
      console.log(`✅ Garment updated with work reference`);
    }

    // ✅ Send notifications to ALL cutting masters about available works
    // ✅ This is just notification - NOT assignment
    if (works.length > 0 && cuttingMasters.length > 0) {
      console.log(`\n📢 Sending notifications to ${cuttingMasters.length} cutting masters about AVAILABLE WORKS...`);
      
      for (const master of cuttingMasters) {
        try {
          await createNotification({
            type: 'work-available',        // Changed from 'work-assigned' to indicate it's available
            recipient: master._id,
            title: '🔔 New Work Available in Pool',
            message: `${works.length} new work(s) are waiting for your acceptance. Click to view and accept.`,
            reference: {
              orderId: orderId,
              workCount: works.length,
              workIds: works.map(w => w._id)
            },
            priority: 'high'
          });
          console.log(`✅ Notification sent to ${master.name}`);
        } catch (notifError) {
          console.log(`❌ Failed to send notification to ${master.name}:`, notifError.message);
        }
      }
    } else {
      console.log(`\n⚠️ No notifications sent:`);
      console.log(`   - Works created: ${works.length}`);
      console.log(`   - Cutting masters: ${cuttingMasters.length}`);
    }

    console.log(`\n✅ ===== CREATE WORKS COMPLETED: ${works.length} works created (OPEN POOL) =====\n`);
    return { success: true, works };
  } catch (error) {
    console.error("\n❌ ===== ERROR CREATING WORKS =====");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return { success: false, error: error.message };
  }
};

// ===== 1. GET ORDER STATS (For Dashboard Filters) =====
export const getOrderStats = async (req, res) => {
  console.log("\n📊 ===== GET ORDER STATS =====");
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

    console.log(`📈 Stats: Today: ${todayCount}, Week: ${weekCount}, Month: ${monthCount}, Total: ${allTimeCount}`);

    const statusStats = await Order.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    console.log("📊 Status breakdown:", statusStats);

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
  console.log("\n🆕 ===== CREATE ORDER STARTED =====");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  
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
    console.log("\n🔐 Authentication Debug:");
    console.log("REQ.USER:", req.user);
    console.log("REQ.USER._id:", req.user?._id);
    console.log("REQ.USER.id:", req.user?.id);
    console.log("REQ.USER.role:", req.user?.role);

    // ✅ Get creatorId from multiple possible locations
    const creatorId = req.user?._id || req.user?.id;

    if (!creatorId) {
      console.error("❌ No user ID found in request. Auth middleware failed.");
      return res.status(401).json({ 
        success: false, 
        message: "Authentication failed. Please log in again." 
      });
    }

    console.log(`✅ Creator authenticated: ID=${creatorId}, Role=${req.user?.role}`);

    if (!customer || !deliveryDate) {
      console.log("❌ Missing required fields:", { customer, deliveryDate });
      return res.status(400).json({ message: "Customer and Delivery Date are required" });
    }

    // Generate order ID
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const orderCount = await Order.countDocuments();
    const sequential = String(orderCount + 1).padStart(3, '0');
    const orderId = `${day}${month}${year}-${sequential}`;
    console.log(`🔑 Generated Order ID: ${orderId}`);

    // Calculate totals from garments if not provided
    let totalMin = priceSummary?.totalMin || 0;
    let totalMax = priceSummary?.totalMax || 0;
    
    if (garments && garments.length > 0) {
      console.log(`\n📦 Fetching ${garments.length} garment details...`);
      const garmentDocs = await Garment.find({ _id: { $in: garments } });
      garmentDocs.forEach(g => {
        totalMin += g.priceRange?.min || 0;
        totalMax += g.priceRange?.max || 0;
        console.log(`   - ${g.name}: ₹${g.priceRange?.min} - ₹${g.priceRange?.max}`);
      });
    }
    console.log(`💰 Price summary - Min: ₹${totalMin}, Max: ₹${totalMax}`);

    // Create order
    console.log("\n💾 Creating order in database...");
    const order = await Order.create({
      orderId,
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

    console.log(`✅ Order created successfully: ${order.orderId}`);
    console.log(`   ID: ${order._id}`);
    console.log(`   Status: ${order.status}`);

    // ✅ AUTO-CREATE WORKS FOR EACH GARMENT (OPEN POOL MODEL)
    if (garments && garments.length > 0) {
      console.log(`\n🔨 Auto-creating works for ${garments.length} garments (OPEN POOL)...`);
      const workResult = await createWorksForOrder(order._id, garments, creatorId);
      
      if (workResult.success) {
        console.log(`✅ Created ${workResult.works.length} works for order ${order.orderId} (all pending, open for acceptance)`);
        
        // Update order status to pending (waiting for cutting master to accept)
        order.status = "pending";
        await order.save();
        console.log(`✅ Order status updated to: ${order.status}`);
      } else {
        console.error("❌ Failed to create works:", workResult.error);
      }
    } else {
      console.log("⚠️ No garments to create works for");
    }

    await order.populate({ path: 'customer', select: 'name phone customerId' });
    console.log("✅ Order populated with customer data");

    console.log("\n✅ ===== ORDER CREATED SUCCESSFULLY =====\n");
    res.status(201).json({ 
      success: true, 
      message: garments && garments.length > 0 
        ? "Order created and works are now available for Cutting Masters to accept" 
        : "Order created successfully",
      order 
    });
  } catch (error) {
    console.error("\n❌ ===== CREATE ORDER ERROR =====");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error("Validation errors:", errors);
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
  console.log("\n📋 ===== GET ALL ORDERS =====");
  console.log("Query params:", req.query);
  
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
      console.log(`🔍 Searching for: "${search}"`);
    }

    if (status && status !== "all") {
      query.status = status;
      console.log(`📊 Filtering by status: ${status}`);
    }

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
      console.log(`📅 Time filter: ${timeFilter}, from ${filterDate}`);
    }

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      console.log(`📅 Custom date range: ${startDate} to ${endDate}`);
    }

    const total = await Order.countDocuments(query);
    console.log(`📊 Total orders found: ${total}`);

    const orders = await Order.find(query)
      .populate('customer', 'name phone customerId')
      .populate("garments")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log(`✅ Returning ${orders.length} orders (page ${page} of ${Math.ceil(total/limit)})`);

    res.json({ 
      success: true, 
      orders, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        pages: Math.ceil(total / limit) 
      } 
    });
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== 4. GET ORDER BY ID =====
export const getOrderById = async (req, res) => {
  console.log(`\n🔍 ===== GET ORDER BY ID: ${req.params.id} =====`);
  
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

    if (!order) {
      console.log("❌ Order not found");
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(`✅ Order found: ${order.orderId}`);
    console.log(`   Customer: ${order.customer?.name}`);
    console.log(`   Garments: ${order.garments?.length || 0}`);
    console.log(`   Status: ${order.status}`);

    res.json({ success: true, order });
  } catch (error) {
    console.error("❌ Get order by ID error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== 5. UPDATE ORDER (FULL UPDATE) =====
export const updateOrder = async (req, res) => {
  console.log(`\n📝 ===== UPDATE ORDER: ${req.params.id} =====`);
  console.log("Update data:", JSON.stringify(req.body, null, 2));
  
  try {
    const { id } = req.params;
    const {
      deliveryDate,
      specialNotes,
      advancePayment,
      priceSummary,
      balanceAmount,
      status,
      newGarments
    } = req.body;

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      console.log("❌ Order not found");
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    console.log(`✅ Order found: ${order.orderId}, Current status: ${order.status}`);

    // Update fields (only if provided)
    if (deliveryDate) {
      order.deliveryDate = deliveryDate;
      console.log(`📅 Updated delivery date: ${deliveryDate}`);
    }
    
    if (specialNotes !== undefined) {
      order.specialNotes = specialNotes;
      console.log(`📝 Updated special notes`);
    }
    
    if (advancePayment) {
      order.advancePayment = {
        amount: advancePayment.amount !== undefined ? advancePayment.amount : order.advancePayment.amount,
        method: advancePayment.method || order.advancePayment.method,
        date: advancePayment.date || order.advancePayment.date || new Date()
      };
      console.log(`💰 Updated advance payment: ₹${order.advancePayment.amount}`);
    }
    
    if (priceSummary) {
      order.priceSummary = {
        totalMin: priceSummary.totalMin !== undefined ? priceSummary.totalMin : order.priceSummary.totalMin,
        totalMax: priceSummary.totalMax !== undefined ? priceSummary.totalMax : order.priceSummary.totalMax
      };
      console.log(`💰 Updated price summary: ₹${order.priceSummary.totalMin} - ₹${order.priceSummary.totalMax}`);
    }
    
    if (balanceAmount !== undefined) {
      order.balanceAmount = balanceAmount;
      console.log(`💰 Updated balance: ₹${balanceAmount}`);
    }
    
    if (status) {
      order.status = status;
      console.log(`🔄 Updated status: ${status}`);
    }

    // If new garments are added, create works for them (OPEN POOL MODEL)
    if (newGarments && newGarments.length > 0) {
      console.log(`\n➕ Adding ${newGarments.length} new garments...`);
      // Add new garments to existing array
      order.garments = [...order.garments, ...newGarments];
      
      // Create works for new garments (OPEN POOL - no assignment)
      const creatorId = req.user?._id || req.user?.id;
      console.log(`🔨 Creating works for new garments (OPEN POOL)...`);
      const workResult = await createWorksForOrder(order._id, newGarments, creatorId);
      
      if (workResult.success) {
        console.log(`✅ Created ${workResult.works.length} works for new garments (pending, open for acceptance)`);
      } else {
        console.error("❌ Failed to create works for new garments:", workResult.error);
      }
    }

    await order.save();
    console.log("✅ Order saved successfully");
    
    // Populate customer data for response
    await order.populate('customer', 'name phone customerId salutation firstName lastName');
    await order.populate('garments');

    console.log("✅ Order updated successfully");
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
  console.log(`\n🔄 ===== UPDATE ORDER STATUS: ${req.params.id} =====`);
  console.log("New status:", req.body.status);
  
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );

    if (!order) {
      console.log("❌ Order not found");
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(`✅ Order status updated to: ${status}`);
    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== 7. DELETE ORDER (Soft Delete) =====
export const deleteOrder = async (req, res) => {
  console.log(`\n🗑️ ===== DELETE ORDER: ${req.params.id} =====`);
  
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log("❌ Order not found");
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(`✅ Order found: ${order.orderId}, Soft deleting...`);

    // Soft delete garments and work
    const garmentResult = await Garment.updateMany({ _id: { $in: order.garments } }, { isActive: false });
    const workResult = await Work.updateMany({ order: order._id }, { isActive: false });

    console.log(`📦 Garments soft deleted: ${garmentResult.modifiedCount}`);
    console.log(`⚙️ Works soft deleted: ${workResult.modifiedCount}`);

    order.isActive = false;
    await order.save();

    console.log("✅ Order deleted successfully");
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("❌ Delete order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};