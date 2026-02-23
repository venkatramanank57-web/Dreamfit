import Garment from "../models/Garment.js";
import Work from "../models/Work.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import r2Service from "../services/r2.service.js";
import mongoose from "mongoose";

// ===== CREATE GARMENT =====
export const createGarment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      name,
      category,
      item,
      measurementTemplate,
      measurementSource,
      measurements,
      additionalInfo,
      estimatedDelivery,
      priority,
      priceRange,
      createdBy,
    } = req.body;

    console.log("📝 Creating garment with data:", {
      orderId,
      name,
      category,
      item,
      createdBy: createdBy || req.body.createdBy || req.user?.id,
    });

    // Initialize image arrays
    let referenceImages = [];
    let customerImages = [];
    let customerClothImages = []; // NEW: Customer physical cloth images

    // Upload reference images if any
    if (req.files?.referenceImages) {
      for (const file of req.files.referenceImages) {
        const upload = await r2Service.uploadFile(file, file.originalname);
        if (upload.success) {
          referenceImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    // Upload customer digital images if any
    if (req.files?.customerImages) {
      for (const file of req.files.customerImages) {
        const upload = await r2Service.uploadFile(file, file.originalname);
        if (upload.success) {
          customerImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    // NEW: Upload customer physical cloth images if any
    if (req.files?.customerClothImages) {
      for (const file of req.files.customerClothImages) {
        const upload = await r2Service.uploadFile(file, file.originalname);
        if (upload.success) {
          customerClothImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    // Parse measurements if provided as string
    let parsedMeasurements = measurements;
    if (typeof measurements === 'string') {
      try {
        parsedMeasurements = JSON.parse(measurements);
      } catch (e) {
        console.error("Error parsing measurements:", e);
      }
    }

    // Parse priceRange if provided as string
    let parsedPriceRange = priceRange;
    if (typeof priceRange === 'string') {
      try {
        parsedPriceRange = JSON.parse(priceRange);
      } catch (e) {
        console.error("Error parsing priceRange:", e);
      }
    }

    // Get the user ID - try multiple sources
    const userId = createdBy || req.body.createdBy || req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(400).json({ 
        message: "createdBy is required for garment creation" 
      });
    }

    console.log("👤 Using userId for garment:", userId);

    const garment = await Garment.create({
      order: orderId,
      name,
      category,
      item,
      measurementTemplate: measurementTemplate || null,
      measurementSource: measurementSource || "template",
      measurements: parsedMeasurements || [],
      referenceImages,
      customerImages,
      customerClothImages, // NEW: Save customer cloth images
      additionalInfo,
      estimatedDelivery,
      priority: priority || "normal",
      priceRange: parsedPriceRange || { min: 0, max: 0 },
    });

    console.log("✅ Garment created:", garment._id);

    // Find cutting master for work assignment
    const cuttingMaster = await User.findOne({ 
      role: "CUTTING_MASTER", 
      isActive: true 
    });

    if (cuttingMaster) {
      console.log("🔪 Found cutting master:", cuttingMaster._id);
      
      const workData = {
        order: orderId,
        garment: garment._id,
        assignedTo: cuttingMaster._id,
        assignedBy: userId,
        status: "pending",
      };
      
      console.log("📝 Creating work with data:", workData);
      
      const work = await Work.create(workData);
      console.log("✅ Work created:", work._id);
      
      garment.workId = work._id;
      await garment.save();
    } else {
      console.log("⚠️ No cutting master found - work not created");
    }

    // Add garment to order
    await Order.findByIdAndUpdate(orderId, {
      $push: { garments: garment._id }
    });

    await garment.populate([
      { path: "category", select: "name" },
      { path: "item", select: "name" },
      { path: "measurementTemplate", select: "name" },
      { path: "workId" },
    ]);

    console.log("✅ Garment fully created and populated");

    res.status(201).json({
      message: "Garment created successfully",
      garment
    });
  } catch (error) {
    console.error("❌ Create garment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET GARMENTS BY ORDER =====
export const getGarmentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const garments = await Garment.find({ 
      order: orderId,
      isActive: true 
    })
      .populate("category", "name")
      .populate("item", "name")
      .populate("measurementTemplate", "name")
      .populate("workId")
      .sort({ createdAt: -1 });

    res.json(garments);
  } catch (error) {
    console.error("Get garments by order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET GARMENT BY ID =====
export const getGarmentById = async (req, res) => {
  try {
    const garment = await Garment.findById(req.params.id)
      .populate("category", "name")
      .populate("item", "name")
      .populate("measurementTemplate", "name")
      .populate("workId")
      .populate({
        path: "order",
        select: "orderId customer",
        populate: { path: "customer", select: "name phone customerId" }
      });

    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    res.json(garment);
  } catch (error) {
    console.error("Get garment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE GARMENT =====
export const updateGarment = async (req, res) => {
  try {
    const garment = await Garment.findById(req.params.id);

    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    const {
      name,
      measurements,
      additionalInfo,
      estimatedDelivery,
      priority,
      priceRange,
      status,
    } = req.body;

    if (name) garment.name = name;
    if (measurements) garment.measurements = measurements;
    if (additionalInfo !== undefined) garment.additionalInfo = additionalInfo;
    if (estimatedDelivery) garment.estimatedDelivery = estimatedDelivery;
    if (priority) garment.priority = priority;
    if (priceRange) garment.priceRange = priceRange;
    if (status) garment.status = status;

    await garment.save();

    res.json({
      message: "Garment updated successfully",
      garment
    });
  } catch (error) {
    console.error("Update garment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE GARMENT =====
export const deleteGarment = async (req, res) => {
  try {
    const garment = await Garment.findById(req.params.id);

    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    // Delete images from R2 - Updated to include customerClothImages
    for (const img of garment.referenceImages) {
      if (img.key) await r2Service.deleteFile(img.key);
    }
    for (const img of garment.customerImages) {
      if (img.key) await r2Service.deleteFile(img.key);
    }
    for (const img of garment.customerClothImages) { // NEW
      if (img.key) await r2Service.deleteFile(img.key);
    }

    // Delete associated work
    if (garment.workId) {
      await Work.findByIdAndUpdate(garment.workId, { isActive: false });
    }

    // Remove garment from order
    await Order.findByIdAndUpdate(garment.order, {
      $pull: { garments: garment._id }
    });

    garment.isActive = false;
    await garment.save();

    res.json({ message: "Garment deleted successfully" });
  } catch (error) {
    console.error("Delete garment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE GARMENT IMAGES =====
export const updateGarmentImages = async (req, res) => {
  try {
    const garment = await Garment.findById(req.params.id);

    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    let referenceImages = [...garment.referenceImages];
    let customerImages = [...garment.customerImages];
    let customerClothImages = [...(garment.customerClothImages || [])]; // NEW

    // Upload new reference images
    if (req.files?.referenceImages) {
      for (const file of req.files.referenceImages) {
        const upload = await r2Service.uploadFile(file, file.originalname);
        if (upload.success) {
          referenceImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    // Upload new customer digital images
    if (req.files?.customerImages) {
      for (const file of req.files.customerImages) {
        const upload = await r2Service.uploadFile(file, file.originalname);
        if (upload.success) {
          customerImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    // NEW: Upload new customer cloth images
    if (req.files?.customerClothImages) {
      for (const file of req.files.customerClothImages) {
        const upload = await r2Service.uploadFile(file, file.originalname);
        if (upload.success) {
          customerClothImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    garment.referenceImages = referenceImages;
    garment.customerImages = customerImages;
    garment.customerClothImages = customerClothImages; // NEW
    await garment.save();

    res.json({
      message: "Garment images updated successfully",
      garment
    });
  } catch (error) {
    console.error("Update garment images error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE GARMENT IMAGE =====
export const deleteGarmentImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageKey, imageType } = req.body; // imageType: 'reference', 'customer', or 'customerCloth'

    const garment = await Garment.findById(id);

    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    // Delete from R2
    await r2Service.deleteFile(imageKey);

    // Remove from appropriate array
    if (imageType === 'reference') {
      garment.referenceImages = garment.referenceImages.filter(
        img => img.key !== imageKey
      );
    } else if (imageType === 'customer') {
      garment.customerImages = garment.customerImages.filter(
        img => img.key !== imageKey
      );
    } else if (imageType === 'customerCloth') { // NEW
      garment.customerClothImages = garment.customerClothImages.filter(
        img => img.key !== imageKey
      );
    }

    await garment.save();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete garment image error:", error);
    res.status(500).json({ message: error.message });
  }
};