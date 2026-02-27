// backend/controllers/customer.controller.js
import Customer from "../models/Customer.js";

// 🔍 Search Customer by Phone
export const getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    console.log(`🔍 Searching customer by phone: ${phone}`);
    
    const customer = await Customer.findOne({ phone });

    if (!customer) {
      console.log(`❌ Customer not found with phone: ${phone}`);
      return res.status(404).json({ message: "Customer Not Found" });
    }

    console.log(`✅ Customer found: ${customer.customerId} - ${customer.name}`);
    res.status(200).json(customer);
  } catch (error) {
    console.error("❌ Search by phone error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Search Customer by Customer ID
export const getCustomerByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log(`🔍 Searching customer by ID: ${customerId}`);
    
    const customer = await Customer.findOne({ customerId });

    if (!customer) {
      console.log(`❌ Customer not found with ID: ${customerId}`);
      return res.status(404).json({ message: "Customer Not Found" });
    }

    console.log(`✅ Customer found: ${customer.customerId} - ${customer.name}`);
    res.status(200).json(customer);
  } catch (error) {
    console.error("❌ Search by customer ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Create New Customer (with auto-generated customerId)
export const createCustomer = async (req, res) => {
  try {
    console.log("\n🔵 ========== CREATE CUSTOMER START ==========");
    console.log("📥 RAW REQUEST BODY:", JSON.stringify(req.body, null, 2));
    
    const { 
      salutation,
      firstName,
      lastName,
      dateOfBirth,
      contactNumber,
      whatsappNumber,
      email,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      notes
    } = req.body;

    // ✅ DEBUG: Log each field individually
    console.log("📋 PARSED FIELDS:");
    console.log("   - salutation:", salutation);
    console.log("   - firstName:", firstName);
    console.log("   - lastName:", lastName);
    console.log("   - dateOfBirth:", dateOfBirth);
    console.log("   - contactNumber:", contactNumber);
    console.log("   - whatsappNumber:", whatsappNumber);
    console.log("   - email:", email);
    console.log("   - addressLine1:", addressLine1);
    console.log("   - addressLine2:", addressLine2);
    console.log("   - city:", city);
    console.log("   - state:", state);
    console.log("   - pincode:", pincode);
    console.log("   - notes:", notes);

    // ✅ Validate required fields before database check
    if (!contactNumber) {
      console.log("❌ Validation failed: contactNumber is missing");
      return res.status(400).json({ message: "Contact number is required" });
    }
    
    if (!addressLine1) {
      console.log("❌ Validation failed: addressLine1 is missing");
      return res.status(400).json({ message: "Address is required" });
    }

    if (!firstName) {
      console.log("❌ Validation failed: firstName is missing");
      return res.status(400).json({ message: "First name is required" });
    }

    // Check if phone already exists
    console.log(`🔍 Checking if phone ${contactNumber} already exists...`);
    const existing = await Customer.findOne({ phone: contactNumber });
    if (existing) {
      console.log(`❌ Phone ${contactNumber} already exists for customer: ${existing.name}`);
      return res.status(400).json({ message: "Customer with this phone already exists" });
    }
    console.log("✅ Phone number is available");

    // Create new customer with all fields
    console.log("📦 Creating new customer with data:");
    const customerData = {
      salutation: salutation || "Mr.",
      firstName,
      lastName: lastName || "",
      dateOfBirth: dateOfBirth || null,
      phone: contactNumber,
      whatsappNumber: whatsappNumber || contactNumber,
      email: email || "",
      addressLine1,
      addressLine2: addressLine2 || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      notes: notes || ""
    };
    console.log(JSON.stringify(customerData, null, 2));

    const newCustomer = await Customer.create(customerData);

    console.log("\n✅ Customer created successfully:");
    console.log("   - ID:", newCustomer._id);
    console.log("   - Customer ID:", newCustomer.customerId);
    console.log("   - Name:", newCustomer.name);
    console.log("   - Phone:", newCustomer.phone);
    console.log("   - DOB:", newCustomer.dateOfBirth);
    console.log("🔵 ========== CREATE CUSTOMER END ==========\n");

    res.status(201).json({
      message: "Customer created successfully",
      customer: newCustomer
    });
  } catch (error) {
    console.error("\n❌ ERROR IN CREATE CUSTOMER:");
    console.error("   - Name:", error.name);
    console.error("   - Message:", error.message);
    console.error("   - Stack:", error.stack);
    
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
        console.error(`   - Validation error - ${key}:`, error.errors[key].message);
      });
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// 📋 Get All Customers
export const getAllCustomers = async (req, res) => {
  try {
    console.log("📋 Fetching all customers...");
    
    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log(`📋 Found ${customers.length} customers`);
    if (customers.length > 0) {
      console.log("   - First customer:", customers[0].name);
    }
    
    res.status(200).json(customers);
  } catch (error) {
    console.error("❌ Get all customers error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ➕ Get Single Customer by MongoDB ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching customer by ID: ${id}`);
    
    const customer = await Customer.findById(id);

    if (!customer) {
      console.log(`❌ Customer not found with ID: ${id}`);
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log(`✅ Found customer: ${customer.customerId} - ${customer.name}`);
    console.log(`   - Phone: ${customer.phone}`);
    console.log(`   - DOB: ${customer.dateOfBirth}`);
    
    res.status(200).json(customer);
  } catch (error) {
    console.error("❌ Get customer by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`\n🔵 ========== UPDATE CUSTOMER START ==========`);
    console.log(`📝 Updating customer ID: ${id}`);
    console.log("📦 Update data:", JSON.stringify(updates, null, 2));

    // Remove customerId from updates (cannot change customerId)
    delete updates.customerId;

    const customer = await Customer.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!customer) {
      console.log(`❌ Customer not found with ID: ${id}`);
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log(`✅ Updated customer: ${customer.customerId} - ${customer.name}`);
    console.log(`   - Phone: ${customer.phone}`);
    console.log(`🔵 ========== UPDATE CUSTOMER END ==========\n`);

    res.status(200).json({
      message: "Customer updated successfully",
      customer
    });
  } catch (error) {
    console.error("❌ Update customer error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete Customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting customer ID: ${id}`);
    
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      console.log(`❌ Customer not found with ID: ${id}`);
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log(`🗑️ Deleted customer: ${customer.customerId} - ${customer.name}`);
    console.log(`   - Phone: ${customer.phone}`);

    res.status(200).json({ 
      message: "Customer deleted successfully",
      deletedCustomer: {
        id: customer._id,
        customerId: customer.customerId,
        name: customer.name
      }
    });
  } catch (error) {
    console.error("❌ Delete customer error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📊 Get Customer Statistics
export const getCustomerStats = async (req, res) => {
  try {
    console.log("📊 Fetching customer statistics...");
    
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ totalOrders: { $gt: 0 } });
    const totalOrders = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: "$totalOrders" } } }
    ]);

    console.log("📊 Statistics:");
    console.log("   - Total Customers:", totalCustomers);
    console.log("   - Active Customers:", activeCustomers);
    console.log("   - Total Orders:", totalOrders[0]?.total || 0);

    res.status(200).json({
      totalCustomers,
      activeCustomers,
      totalOrders: totalOrders[0]?.total || 0
    });
  } catch (error) {
    console.error("❌ Get customer stats error:", error);
    res.status(500).json({ message: error.message });
  }
};