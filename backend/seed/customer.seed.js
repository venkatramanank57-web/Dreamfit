// backend/seed/customer.seed.js
import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 ========== CUSTOMER SEEDER STARTED ==========");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected for seeding");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// 10 Demo Customers
const customers = [
  {
    salutation: "Mr.",
    firstName: "Ramesh",
    lastName: "Kumar",
    dateOfBirth: new Date("1985-05-15"),
    phone: "9876543210",
    whatsappNumber: "9876543210",
    email: "ramesh.kumar@gmail.com",
    addressLine1: "12/4, Anna Salai",
    addressLine2: "T. Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600017",
    notes: "Regular customer, prefers morning delivery",
    totalOrders: 5
  },
  {
    salutation: "Mrs.",
    firstName: "Priya",
    lastName: "Venkatesh",
    dateOfBirth: new Date("1990-08-22"),
    phone: "9988776655",
    whatsappNumber: "9988776655",
    email: "priya.v@gmail.com",
    addressLine1: "45, Ram Nagar",
    addressLine2: "Coimbatore",
    city: "Coimbatore",
    state: "Tamil Nadu",
    pincode: "641001",
    notes: "VIP customer, prefers WhatsApp communication",
    totalOrders: 8
  },
  {
    salutation: "Mr.",
    firstName: "Suresh",
    lastName: "Reddy",
    dateOfBirth: new Date("1988-12-03"),
    phone: "9123456780",
    whatsappNumber: "9123456780",
    email: "suresh.reddy@yahoo.com",
    addressLine1: "78, MG Road",
    addressLine2: "Gandhi Nagar",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560009",
    notes: "Corporate client, needs bulk orders",
    totalOrders: 3
  },
  {
    salutation: "Ms.",
    firstName: "Divya",
    lastName: "Krishnan",
    dateOfBirth: new Date("1995-03-10"),
    phone: "8765432109",
    whatsappNumber: "8765432109",
    email: "divya.k@gmail.com",
    addressLine1: "23, North Street",
    addressLine2: "Madurai",
    city: "Madurai",
    state: "Tamil Nadu",
    pincode: "625001",
    notes: "New customer, interested in bridal wear",
    totalOrders: 1
  },
  {
    salutation: "Mr.",
    firstName: "Arun",
    lastName: "Prakash",
    dateOfBirth: new Date("1982-07-19"),
    phone: "9012345678",
    whatsappNumber: "9012345678",
    email: "arun.prakash@gmail.com",
    addressLine1: "56, Velachery Main Road",
    addressLine2: "Velachery",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600042",
    notes: "Prefers weekend delivery",
    totalOrders: 4
  },
  {
    salutation: "Mrs.",
    firstName: "Lakshmi",
    lastName: "Narayanan",
    dateOfBirth: new Date("1978-11-25"),
    phone: "8901234567",
    whatsappNumber: "8901234567",
    email: "lakshmi.n@gmail.com",
    addressLine1: "34, East Coast Road",
    addressLine2: "Thiruvanmiyur",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600041",
    notes: "Long-time customer, family orders",
    totalOrders: 12
  },
  {
    salutation: "Mr.",
    firstName: "Karthik",
    lastName: "Subramaniam",
    dateOfBirth: new Date("1992-09-30"),
    phone: "9345678901",
    whatsappNumber: "9345678901",
    email: "karthik.s@gmail.com",
    addressLine1: "67, Trichy Road",
    addressLine2: "Singanallur",
    city: "Coimbatore",
    state: "Tamil Nadu",
    pincode: "641005",
    notes: "Young professional, prefers trendy styles",
    totalOrders: 2
  },
  {
    salutation: "Ms.",
    firstName: "Anitha",
    lastName: "Sridhar",
    dateOfBirth: new Date("1987-04-12"),
    phone: "9567890123",
    whatsappNumber: "9567890123",
    email: "anitha.sridhar@gmail.com",
    addressLine1: "89, Avinashi Road",
    addressLine2: "Peelamedu",
    city: "Coimbatore",
    state: "Tamil Nadu",
    pincode: "641004",
    notes: "Prefers calls over WhatsApp",
    totalOrders: 6
  },
  {
    salutation: "Dr.",
    firstName: "Venkatesh",
    lastName: "Raman",
    dateOfBirth: new Date("1975-06-18"),
    phone: "9789012345",
    whatsappNumber: "9789012345",
    email: "dr.venkatesh@gmail.com",
    addressLine1: "123, Cathedral Road",
    addressLine2: "Gopalapuram",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600086",
    notes: "Doctor, prefers formal wear",
    totalOrders: 7
  },
  {
    salutation: "Mrs.",
    firstName: "Meena",
    lastName: "Krishnamurthy",
    dateOfBirth: new Date("1983-02-28"),
    phone: "8998765432",
    whatsappNumber: "8998765432",
    email: "meena.k@gmail.com",
    addressLine1: "45, Thillai Nagar",
    addressLine2: "Trichy",
    city: "Trichy",
    state: "Tamil Nadu",
    pincode: "620018",
    notes: "Regular customer, refers friends",
    totalOrders: 9
  }
];

// Seed function - using create() instead of insertMany()
const seedCustomers = async () => {
  try {
    await connectDB();
    
    console.log("\n🗑️ Clearing existing customers...");
    await Customer.deleteMany({});
    console.log("✅ Existing customers cleared");
    
    console.log("\n🌱 Seeding 10 demo customers...");
    
    const createdCustomers = [];
    for (const customerData of customers) {
      // ✅ Use create() to trigger pre-save hook
      const customer = await Customer.create(customerData);
      createdCustomers.push(customer);
      console.log(`   ✅ Created: ${customer.name} (${customer.customerId})`);
    }
    
    console.log("\n✅ ========== SEEDING COMPLETED ==========");
    console.log(`📊 Total customers created: ${createdCustomers.length}`);
    
    console.log("\n📋 Customer List:");
    createdCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} - ${customer.customerId} - ${customer.phone}`);
    });
    
  } catch (error) {
    console.error("\n❌ Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n📡 Disconnected from MongoDB");
  }
};

seedCustomers();