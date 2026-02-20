// backend/controllers/customer.controller.js
import Customer from "../models/Customer.js";

// 🔍 Search Customer by Phone
export const getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const customer = await Customer.findOne({ phone });

    if (!customer) {
      return res.status(404).json({ message: "Customer Not Found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Create New Customer (Updated for new fields)
export const createCustomer = async (req, res) => {
  try {
    const { 
      salutation,
      firstName,
      lastName,
      contactNumber, // This is phone
      whatsappNumber,
      email,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      notes
    } = req.body;

    // Check if phone already exists
    const existing = await Customer.findOne({ phone: contactNumber });
    if (existing) {
      return res.status(400).json({ message: "Customer with this phone already exists" });
    }

    // Create new customer with all fields
    const newCustomer = await Customer.create({
      salutation: salutation || "Mr.",
      firstName,
      lastName: lastName || "",
      phone: contactNumber,
      whatsappNumber: whatsappNumber || contactNumber,
      email: email || "",
      addressLine1,
      addressLine2: addressLine2 || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      notes: notes || ""
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📋 Get All Customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➕ Get Single Customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const customer = await Customer.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete Customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};