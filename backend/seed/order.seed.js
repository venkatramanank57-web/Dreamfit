import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Order from "../models/Order.js";
import Garment from "../models/Garment.js";
import Work from "../models/Work.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";

dotenv.config();

const seedOrders = async () => {
  try {
    await connectDB();
    
    console.log("🔍 Checking model imports:");
    console.log("   Order:", Order ? "✅" : "❌");
    console.log("   Garment:", Garment ? "✅" : "❌");
    console.log("   Work:", Work ? "✅" : "❌");
    console.log("   Customer:", Customer ? "✅" : "❌");
    console.log("   User:", User ? "✅" : "❌");

    // Clear existing data
    console.log("\n🧹 Clearing existing data...");
    
    if (Work) {
      const workDel = await Work.deleteMany({});
      console.log(`   Works cleared: ${workDel.deletedCount}`);
    }
    
    if (Garment) {
      const garmentDel = await Garment.deleteMany({});
      console.log(`   Garments cleared: ${garmentDel.deletedCount}`);
    }
    
    if (Order) {
      const orderDel = await Order.deleteMany({});
      console.log(`   Orders cleared: ${orderDel.deletedCount}`);
    }

    // Get existing customers
    const customers = await Customer.find().limit(5);
    if (customers.length === 0) {
      console.log("❌ No customers found. Please run customer seed first.");
      process.exit(1);
    }
    console.log(`\n📋 Found ${customers.length} customers`);

    // Get admin user
    const admin = await User.findOne({ role: "ADMIN" });
    if (!admin) {
      console.log("❌ No admin user found. Please run user seed first.");
      process.exit(1);
    }
    console.log(`👤 Admin found: ${admin.name}`);

    // Get cutting master
    const cuttingMaster = await User.findOne({ role: "CUTTING_MASTER" });
    if (!cuttingMaster) {
      console.log("❌ No cutting master found. Please run user seed first.");
      process.exit(1);
    }
    console.log(`✂️ Cutting Master found: ${cuttingMaster.name}`);

    // Create orders
    console.log("\n📦 Creating orders...");
    
    const orders = [];

    // Order 1 - Confirmed
    const order1 = new Order({
      customer: customers[0]._id,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "confirmed",
      specialNotes: "Urgent order - needs delivery before Friday",
      advancePayment: { amount: 500, method: "cash" },
      createdBy: admin._id,
    });
    await order1.save();
    console.log(`   ✅ Created order: ${order1.orderId} - ${order1.status}`);
    orders.push(order1);

    // Order 2 - In Progress
    const order2 = new Order({
      customer: customers[1]?._id || customers[0]._id,
      deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: "in-progress",
      specialNotes: "Customer wants extra fitting",
      advancePayment: { amount: 1000, method: "upi" },
      createdBy: admin._id,
    });
    await order2.save();
    console.log(`   ✅ Created order: ${order2.orderId} - ${order2.status}`);
    orders.push(order2);

    // Order 3 - Draft
    const order3 = new Order({
      customer: customers[2]?._id || customers[0]._id,
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: "draft",
      specialNotes: "Waiting for fabric selection",
      advancePayment: { amount: 0, method: "cash" },
      createdBy: admin._id,
    });
    await order3.save();
    console.log(`   ✅ Created order: ${order3.orderId} - ${order3.status}`);
    orders.push(order3);

    // Order 4 - Delivered
    const order4 = new Order({
      customer: customers[3]?._id || customers[0]._id,
      deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "delivered",
      specialNotes: "Wedding order - delivered on time",
      advancePayment: { amount: 2000, method: "bank-transfer" },
      createdBy: admin._id,
    });
    await order4.save();
    console.log(`   ✅ Created order: ${order4.orderId} - ${order4.status}`);
    orders.push(order4);

    // Order 5 - Cancelled
    const order5 = new Order({
      customer: customers[4]?._id || customers[0]._id,
      deliveryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      status: "cancelled",
      specialNotes: "Customer cancelled due to personal reasons",
      advancePayment: { amount: 300, method: "card" },
      createdBy: admin._id,
    });
    await order5.save();
    console.log(`   ✅ Created order: ${order5.orderId} - ${order5.status}`);
    orders.push(order5);

    console.log(`\n✅ Created ${orders.length} orders successfully!`);

    // Show summary
    console.log("\n📋 Orders Summary:");
    console.log("==================");
    orders.forEach((order) => {
      const statusEmoji = {
        draft: "🟡",
        confirmed: "🟠",
        "in-progress": "🔵",
        delivered: "🟢",
        cancelled: "🔴"
      }[order.status] || "⚪";
      
      const date = new Date(order.deliveryDate).toLocaleDateString();
      console.log(`   ${statusEmoji} ${order.orderId} - ${order.status} (Delivery: ${date})`);
    });
    console.log("==================");

    console.log("\n🌱 ORDER SEEDING COMPLETED SUCCESSFULLY!");
    process.exit();
  } catch (error) {
    console.error("❌ ORDER SEEDING ERROR:", error);
    process.exit(1);
  }
};

seedOrders();