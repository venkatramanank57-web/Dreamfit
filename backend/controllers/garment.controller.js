// import Garment from "../models/Garment.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import Order from "../models/Order.js";
// import r2Service from "../services/r2.service.js";
// import mongoose from "mongoose";

// // ===== CREATE GARMENT =====
// // backend/controllers/garment.controller.js

// export const createGarment = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const {
//       name,
//       category,
//       item,
//       measurementTemplate,
//       measurementSource,
//       measurements,
//       additionalInfo,
//       estimatedDelivery,
//       priority,
//       priceRange,
//       createdBy,
//     } = req.body;

//     console.log("📝 Creating garment with data:", {
//       orderId,
//       name,
//       category,
//       item,
//       createdBy: createdBy || req.body.createdBy || req.user?.id,
//     });

//     // ✅ CRITICAL: Log what files are received
//     console.log("📸 Files received:", {
//       referenceImages: req.files?.referenceImages?.length || 0,
//       customerImages: req.files?.customerImages?.length || 0,
//       customerClothImages: req.files?.customerClothImages?.length || 0,
//     });

//     // Initialize image arrays
//     let referenceImages = [];
//     let customerImages = [];
//     let customerClothImages = [];

//     // ✅ Upload reference images to R2
//     if (req.files?.referenceImages && req.files.referenceImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.referenceImages.length} reference images`);
//       for (const file of req.files.referenceImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           referenceImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // ✅ Upload customer digital images to R2
//     if (req.files?.customerImages && req.files.customerImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.customerImages.length} customer images`);
//       for (const file of req.files.customerImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer'
//         );
//         if (upload.success) {
//           customerImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // ✅ Upload customer cloth images to R2
//     if (req.files?.customerClothImages && req.files.customerClothImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.customerClothImages.length} cloth images`);
//       for (const file of req.files.customerClothImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/cloth'
//         );
//         if (upload.success) {
//           customerClothImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // Parse measurements if provided as string
//     let parsedMeasurements = measurements;
//     if (typeof measurements === 'string') {
//       try {
//         parsedMeasurements = JSON.parse(measurements);
//       } catch (e) {
//         console.error("Error parsing measurements:", e);
//       }
//     }

//     // Parse priceRange if provided as string
//     let parsedPriceRange = priceRange;
//     if (typeof priceRange === 'string') {
//       try {
//         parsedPriceRange = JSON.parse(priceRange);
//       } catch (e) {
//         console.error("Error parsing priceRange:", e);
//       }
//     }

//     // Get the user ID - try multiple sources
//     const userId = createdBy || req.body.createdBy || req.user?.id || req.user?._id;
    
//     if (!userId) {
//       return res.status(400).json({ 
//         message: "createdBy is required for garment creation" 
//       });
//     }

//     console.log("👤 Using userId for garment:", userId);

//     // ✅ Create garment with all image arrays
//     const garment = new Garment({
//       order: orderId,
//       name,
//       category,
//       item,
//       measurementTemplate: measurementTemplate || null,
//       measurementSource: measurementSource || "template",
//       measurements: parsedMeasurements || [],
//       referenceImages,      // ✅ This will be saved to database
//       customerImages,       // ✅ This will be saved to database
//       customerClothImages,  // ✅ This will be saved to database
//       additionalInfo,
//       estimatedDelivery,
//       priority: priority || "normal",
//       priceRange: parsedPriceRange || { min: 0, max: 0 },
//     });

//     console.log("💾 Saving garment with images:", {
//       referenceImages: referenceImages.length,
//       customerImages: customerImages.length,
//       customerClothImages: customerClothImages.length,
//     });

//     await garment.save();
    
//     console.log("✅ Garment created with ID:", garment._id);
//     console.log("📸 Images saved in database:", {
//       reference: garment.referenceImages.length,
//       customer: garment.customerImages.length,
//       cloth: garment.customerClothImages.length,
//     });

//     // Find cutting master for work assignment
//     const cuttingMaster = await User.findOne({ 
//       role: "CUTTING_MASTER", 
//       isActive: true 
//     });

//     if (cuttingMaster) {
//       console.log("🔪 Found cutting master:", cuttingMaster._id);
      
//       const workData = {
//         order: orderId,
//         garment: garment._id,
//         assignedTo: cuttingMaster._id,
//         assignedBy: userId,
//         status: "pending",
//       };
      
//       console.log("📝 Creating work with data:", workData);
      
//       const work = await Work.create(workData);
//       console.log("✅ Work created:", work._id);
      
//       garment.workId = work._id;
//       await garment.save();
//     } else {
//       console.log("⚠️ No cutting master found - work not created");
//     }

//     // Add garment to order
//     await Order.findByIdAndUpdate(orderId, {
//       $push: { garments: garment._id }
//     });

//     await garment.populate([
//       { path: "category", select: "name" },
//       { path: "item", select: "name" },
//       { path: "measurementTemplate", select: "name" },
//       { path: "workId" },
//     ]);

//     console.log("✅ Garment fully created and populated");

//     res.status(201).json({
//       message: "Garment created successfully",
//       garment
//     });
//   } catch (error) {
//     console.error("❌ Create garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET GARMENTS BY ORDER =====
// export const getGarmentsByOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     const garments = await Garment.find({ 
//       order: orderId,
//       isActive: true 
//     })
//       .populate("category", "name")
//       .populate("item", "name")
//       .populate("measurementTemplate", "name")
//       .populate("workId")
//       .sort({ createdAt: -1 });

//     console.log(`📦 Found ${garments.length} garments for order ${orderId}`);
//     garments.forEach(g => {
//       console.log(`🎨 Garment ${g.garmentId}:`, {
//         referenceImages: g.referenceImages?.length || 0,
//         customerImages: g.customerImages?.length || 0,
//         customerClothImages: g.customerClothImages?.length || 0
//       });
//     });

//     res.json(garments);
//   } catch (error) {
//     console.error("Get garments by order error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET GARMENT BY ID =====
// export const getGarmentById = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id)
//       .populate("category", "name")
//       .populate("item", "name")
//       .populate("measurementTemplate", "name")
//       .populate("workId")
//       .populate({
//         path: "order",
//         select: "orderId customer",
//         populate: { path: "customer", select: "name phone customerId" }
//       });

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     res.json(garment);
//   } catch (error) {
//     console.error("Get garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE GARMENT =====
// // backend/controllers/garment.controller.js

// // ===== UPDATE GARMENT =====
// export const updateGarment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("📝 Updating garment:", id);
//     console.log("📦 Request body:", req.body);
//     console.log("📸 Request files:", req.files);

//     const garment = await Garment.findById(id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Parse JSON fields from FormData
//     let {
//       name,
//       category,
//       item,
//       measurementTemplate,
//       measurementSource,
//       measurements,
//       additionalInfo,
//       estimatedDelivery,
//       priority,
//       priceRange,
//       status,
//       existingReferenceImages,
//       existingCustomerImages,
//       existingClothImages
//     } = req.body;

//     // Parse JSON strings if they came from FormData
//     if (measurements && typeof measurements === 'string') {
//       try {
//         measurements = JSON.parse(measurements);
//       } catch (e) {
//         console.error("Error parsing measurements:", e);
//       }
//     }

//     if (priceRange && typeof priceRange === 'string') {
//       try {
//         priceRange = JSON.parse(priceRange);
//       } catch (e) {
//         console.error("Error parsing priceRange:", e);
//       }
//     }

//     // Parse existing image keys
//     let keepReferenceKeys = [];
//     let keepCustomerKeys = [];
//     let keepClothKeys = [];

//     if (existingReferenceImages && typeof existingReferenceImages === 'string') {
//       try {
//         keepReferenceKeys = JSON.parse(existingReferenceImages);
//       } catch (e) {
//         console.error("Error parsing existingReferenceImages:", e);
//       }
//     }

//     if (existingCustomerImages && typeof existingCustomerImages === 'string') {
//       try {
//         keepCustomerKeys = JSON.parse(existingCustomerImages);
//       } catch (e) {
//         console.error("Error parsing existingCustomerImages:", e);
//       }
//     }

//     if (existingClothImages && typeof existingClothImages === 'string') {
//       try {
//         keepClothKeys = JSON.parse(existingClothImages);
//       } catch (e) {
//         console.error("Error parsing existingClothImages:", e);
//       }
//     }

//     // Update basic fields
//     if (name) garment.name = name;
//     if (category) garment.category = category;
//     if (item) garment.item = item;
//     if (measurementTemplate) garment.measurementTemplate = measurementTemplate;
//     if (measurementSource) garment.measurementSource = measurementSource;
//     if (measurements) garment.measurements = measurements;
//     if (additionalInfo !== undefined) garment.additionalInfo = additionalInfo;
//     if (estimatedDelivery) garment.estimatedDelivery = estimatedDelivery;
//     if (priority) garment.priority = priority;
//     if (priceRange) garment.priceRange = priceRange;
//     if (status) garment.status = status;

//     // Handle images - keep only those not deleted
//     if (keepReferenceKeys.length > 0) {
//       garment.referenceImages = garment.referenceImages.filter(img => 
//         keepReferenceKeys.includes(img.key)
//       );
//     } else {
//       garment.referenceImages = []; // Remove all if none to keep
//     }

//     if (keepCustomerKeys.length > 0) {
//       garment.customerImages = garment.customerImages.filter(img => 
//         keepCustomerKeys.includes(img.key)
//       );
//     } else {
//       garment.customerImages = [];
//     }

//     if (keepClothKeys.length > 0) {
//       garment.customerClothImages = garment.customerClothImages.filter(img => 
//         keepClothKeys.includes(img.key)
//       );
//     } else {
//       garment.customerClothImages = [];
//     }

//     // Upload new reference images
//     if (req.files?.referenceImages) {
//       for (const file of req.files.referenceImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           garment.referenceImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     // Upload new customer images
//     if (req.files?.customerImages) {
//       for (const file of req.files.customerImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer'
//         );
//         if (upload.success) {
//           garment.customerImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     // Upload new cloth images
//     if (req.files?.customerClothImages) {
//       for (const file of req.files.customerClothImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/cloth'
//         );
//         if (upload.success) {
//           garment.customerClothImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     await garment.save();
//     console.log("✅ Garment updated successfully");

//     res.json({
//       message: "Garment updated successfully",
//       garment
//     });

//   } catch (error) {
//     console.error("❌ Update garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
// // ===== DELETE GARMENT =====
// export const deleteGarment = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Delete images from R2
//     for (const img of garment.referenceImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }
//     for (const img of garment.customerImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }
//     for (const img of garment.customerClothImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }

//     // Delete associated work
//     if (garment.workId) {
//       await Work.findByIdAndUpdate(garment.workId, { isActive: false });
//     }

//     // Remove garment from order
//     await Order.findByIdAndUpdate(garment.order, {
//       $pull: { garments: garment._id }
//     });

//     garment.isActive = false;
//     await garment.save();

//     res.json({ message: "Garment deleted successfully" });
//   } catch (error) {
//     console.error("Delete garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE GARMENT IMAGES =====
// export const updateGarmentImages = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     let referenceImages = [...garment.referenceImages];
//     let customerImages = [...garment.customerImages];
//     let customerClothImages = [...(garment.customerClothImages || [])];

//     // Upload new reference images
//     if (req.files?.referenceImages) {
//       for (const file of req.files.referenceImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           referenceImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     // Upload new customer digital images
//     if (req.files?.customerImages) {
//       for (const file of req.files.customerImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer-digital'
//         );
//         if (upload.success) {
//           customerImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     // Upload new customer cloth images
//     if (req.files?.customerClothImages) {
//       for (const file of req.files.customerClothImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer-cloth'
//         );
//         if (upload.success) {
//           customerClothImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     garment.referenceImages = referenceImages;
//     garment.customerImages = customerImages;
//     garment.customerClothImages = customerClothImages;
//     await garment.save();

//     res.json({
//       message: "Garment images updated successfully",
//       garment
//     });
//   } catch (error) {
//     console.error("Update garment images error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE GARMENT IMAGE =====
// export const deleteGarmentImage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { imageKey, imageType } = req.body;

//     const garment = await Garment.findById(id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Delete from R2
//     await r2Service.deleteFile(imageKey);

//     // Remove from appropriate array
//     if (imageType === 'reference') {
//       garment.referenceImages = garment.referenceImages.filter(
//         img => img.key !== imageKey
//       );
//     } else if (imageType === 'customer') {
//       garment.customerImages = garment.customerImages.filter(
//         img => img.key !== imageKey
//       );
//     } else if (imageType === 'customerCloth') {
//       garment.customerClothImages = garment.customerClothImages.filter(
//         img => img.key !== imageKey
//       );
//     }

//     await garment.save();

//     res.json({ message: "Image deleted successfully" });
//   } catch (error) {
//     console.error("Delete garment image error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };






// // controllers/garment.controller.js
// import Garment from "../models/Garment.js";
// import Work from "../models/Work.js";
// // import User from "../models/User.js"; // ❌ REMOVE THIS - Not needed
// import CuttingMaster from "../models/CuttingMaster.js"; // ✅ ADD THIS
// import Order from "../models/Order.js";
// import r2Service from "../services/r2.service.js";
// import mongoose from "mongoose";

// // ===== CREATE GARMENT =====
// export const createGarment = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const {
//       name,
//       category,
//       item,
//       measurementTemplate,
//       measurementSource,
//       measurements,
//       additionalInfo,
//       estimatedDelivery,
//       priority,
//       priceRange,
//       createdBy,
//     } = req.body;

//     console.log("📝 Creating garment with data:", {
//       orderId,
//       name,
//       category,
//       item,
//       createdBy: createdBy || req.body.createdBy || req.user?.id,
//     });

//     // ✅ CRITICAL: Log what files are received
//     console.log("📸 Files received:", {
//       referenceImages: req.files?.referenceImages?.length || 0,
//       customerImages: req.files?.customerImages?.length || 0,
//       customerClothImages: req.files?.customerClothImages?.length || 0,
//     });

//     // Initialize image arrays
//     let referenceImages = [];
//     let customerImages = [];
//     let customerClothImages = [];

//     // ✅ Upload reference images to R2
//     if (req.files?.referenceImages && req.files.referenceImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.referenceImages.length} reference images`);
//       for (const file of req.files.referenceImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           referenceImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // ✅ Upload customer digital images to R2
//     if (req.files?.customerImages && req.files.customerImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.customerImages.length} customer images`);
//       for (const file of req.files.customerImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer'
//         );
//         if (upload.success) {
//           customerImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // ✅ Upload customer cloth images to R2
//     if (req.files?.customerClothImages && req.files.customerClothImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.customerClothImages.length} cloth images`);
//       for (const file of req.files.customerClothImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/cloth'
//         );
//         if (upload.success) {
//           customerClothImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // Parse measurements if provided as string
//     let parsedMeasurements = measurements;
//     if (typeof measurements === 'string') {
//       try {
//         parsedMeasurements = JSON.parse(measurements);
//       } catch (e) {
//         console.error("Error parsing measurements:", e);
//       }
//     }

//     // Parse priceRange if provided as string
//     let parsedPriceRange = priceRange;
//     if (typeof priceRange === 'string') {
//       try {
//         parsedPriceRange = JSON.parse(priceRange);
//       } catch (e) {
//         console.error("Error parsing priceRange:", e);
//       }
//     }

//     // Get the user ID - try multiple sources
//     const userId = createdBy || req.body.createdBy || req.user?.id || req.user?._id;
    
//     if (!userId) {
//       return res.status(400).json({ 
//         message: "createdBy is required for garment creation" 
//       });
//     }

//     console.log("👤 Using userId for garment:", userId);

//     // ✅ Create garment with all image arrays
//     const garment = new Garment({
//       order: orderId,
//       name,
//       category,
//       item,
//       measurementTemplate: measurementTemplate || null,
//       measurementSource: measurementSource || "template",
//       measurements: parsedMeasurements || [],
//       referenceImages,      // ✅ This will be saved to database
//       customerImages,       // ✅ This will be saved to database
//       customerClothImages,  // ✅ This will be saved to database
//       additionalInfo,
//       estimatedDelivery,
//       priority: priority || "normal",
//       priceRange: parsedPriceRange || { min: 0, max: 0 },
//     });

//     console.log("💾 Saving garment with images:", {
//       referenceImages: referenceImages.length,
//       customerImages: customerImages.length,
//       customerClothImages: customerClothImages.length,
//     });

//     await garment.save();
    
//     console.log("✅ Garment created with ID:", garment._id);
//     console.log("📸 Images saved in database:", {
//       reference: garment.referenceImages.length,
//       customer: garment.customerImages.length,
//       cloth: garment.customerClothImages.length,
//     });

//     // ✅ FIXED: Find cutting master from CuttingMaster model, not User model
//     console.log("🔍 Searching for cutting master in CuttingMaster model...");
//     const cuttingMaster = await CuttingMaster.findOne({ isActive: true });
    
//     if (cuttingMaster) {
//       console.log(`✅ Found cutting master: ${cuttingMaster.name} (ID: ${cuttingMaster._id})`);
      
//       // Generate work ID
//       const date = new Date();
//       const day = String(date.getDate()).padStart(2, '0');
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const year = date.getFullYear();
//       const workCount = await Work.countDocuments();
//       const sequential = String(workCount + 1).padStart(4, '0');
//       const garmentPrefix = garment.name?.substring(0, 4).toUpperCase() || 'WRK';
//       const workId = `${garmentPrefix}-${day}${month}${year}-${sequential}`;
      
//       const workData = {
//         workId,
//         order: orderId,
//         garment: garment._id,
//         cuttingMaster: cuttingMaster._id, // ✅ Using cuttingMaster from correct model
//         status: "pending",
//         createdBy: userId,
//         estimatedDelivery: estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
//       };
      
//       console.log("📝 Creating work with data:", workData);
      
//       const work = await Work.create(workData);
//       console.log(`✅ Work created successfully! ID: ${work._id}`);
//       console.log(`✂️ Assigned to cutting master: ${cuttingMaster.name}`);
      
//       garment.workId = work._id;
//       await garment.save();
//       console.log("✅ Garment updated with work reference");
//     } else {
//       console.log("⚠️ No cutting master found in CuttingMaster model - work not created");
//       console.log("👉 Please create a cutting master in the database first");
//     }

//     // Add garment to order
//     await Order.findByIdAndUpdate(orderId, {
//       $push: { garments: garment._id }
//     });
//     console.log("✅ Garment added to order");

//     await garment.populate([
//       { path: "category", select: "name" },
//       { path: "item", select: "name" },
//       { path: "measurementTemplate", select: "name" },
//       { path: "workId" },
//     ]);

//     console.log("✅ Garment fully created and populated");

//     res.status(201).json({
//       message: "Garment created successfully",
//       garment
//     });
//   } catch (error) {
//     console.error("❌ Create garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET GARMENTS BY ORDER =====
// export const getGarmentsByOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     const garments = await Garment.find({ 
//       order: orderId,
//       isActive: true 
//     })
//       .populate("category", "name")
//       .populate("item", "name")
//       .populate("measurementTemplate", "name")
//       .populate("workId")
//       .sort({ createdAt: -1 });

//     console.log(`📦 Found ${garments.length} garments for order ${orderId}`);
//     garments.forEach(g => {
//       console.log(`🎨 Garment ${g.garmentId}:`, {
//         referenceImages: g.referenceImages?.length || 0,
//         customerImages: g.customerImages?.length || 0,
//         customerClothImages: g.customerClothImages?.length || 0
//       });
//     });

//     res.json(garments);
//   } catch (error) {
//     console.error("Get garments by order error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET GARMENT BY ID =====
// export const getGarmentById = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id)
//       .populate("category", "name")
//       .populate("item", "name")
//       .populate("measurementTemplate", "name")
//       .populate("workId")
//       .populate({
//         path: "order",
//         select: "orderId customer",
//         populate: { path: "customer", select: "name phone customerId" }
//       });

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     res.json(garment);
//   } catch (error) {
//     console.error("Get garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE GARMENT =====
// export const updateGarment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("📝 Updating garment:", id);
//     console.log("📦 Request body:", req.body);
//     console.log("📸 Request files:", req.files);

//     const garment = await Garment.findById(id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Parse JSON fields from FormData
//     let {
//       name,
//       category,
//       item,
//       measurementTemplate,
//       measurementSource,
//       measurements,
//       additionalInfo,
//       estimatedDelivery,
//       priority,
//       priceRange,
//       status,
//       existingReferenceImages,
//       existingCustomerImages,
//       existingClothImages
//     } = req.body;

//     // Parse JSON strings if they came from FormData
//     if (measurements && typeof measurements === 'string') {
//       try {
//         measurements = JSON.parse(measurements);
//       } catch (e) {
//         console.error("Error parsing measurements:", e);
//       }
//     }

//     if (priceRange && typeof priceRange === 'string') {
//       try {
//         priceRange = JSON.parse(priceRange);
//       } catch (e) {
//         console.error("Error parsing priceRange:", e);
//       }
//     }

//     // Parse existing image keys
//     let keepReferenceKeys = [];
//     let keepCustomerKeys = [];
//     let keepClothKeys = [];

//     if (existingReferenceImages && typeof existingReferenceImages === 'string') {
//       try {
//         keepReferenceKeys = JSON.parse(existingReferenceImages);
//       } catch (e) {
//         console.error("Error parsing existingReferenceImages:", e);
//       }
//     }

//     if (existingCustomerImages && typeof existingCustomerImages === 'string') {
//       try {
//         keepCustomerKeys = JSON.parse(existingCustomerImages);
//       } catch (e) {
//         console.error("Error parsing existingCustomerImages:", e);
//       }
//     }

//     if (existingClothImages && typeof existingClothImages === 'string') {
//       try {
//         keepClothKeys = JSON.parse(existingClothImages);
//       } catch (e) {
//         console.error("Error parsing existingClothImages:", e);
//       }
//     }

//     // Update basic fields
//     if (name) garment.name = name;
//     if (category) garment.category = category;
//     if (item) garment.item = item;
//     if (measurementTemplate) garment.measurementTemplate = measurementTemplate;
//     if (measurementSource) garment.measurementSource = measurementSource;
//     if (measurements) garment.measurements = measurements;
//     if (additionalInfo !== undefined) garment.additionalInfo = additionalInfo;
//     if (estimatedDelivery) garment.estimatedDelivery = estimatedDelivery;
//     if (priority) garment.priority = priority;
//     if (priceRange) garment.priceRange = priceRange;
//     if (status) garment.status = status;

//     // Handle images - keep only those not deleted
//     if (keepReferenceKeys.length > 0) {
//       garment.referenceImages = garment.referenceImages.filter(img => 
//         keepReferenceKeys.includes(img.key)
//       );
//     } else {
//       garment.referenceImages = []; // Remove all if none to keep
//     }

//     if (keepCustomerKeys.length > 0) {
//       garment.customerImages = garment.customerImages.filter(img => 
//         keepCustomerKeys.includes(img.key)
//       );
//     } else {
//       garment.customerImages = [];
//     }

//     if (keepClothKeys.length > 0) {
//       garment.customerClothImages = garment.customerClothImages.filter(img => 
//         keepClothKeys.includes(img.key)
//       );
//     } else {
//       garment.customerClothImages = [];
//     }

//     // Upload new reference images
//     if (req.files?.referenceImages) {
//       for (const file of req.files.referenceImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           garment.referenceImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     // Upload new customer images
//     if (req.files?.customerImages) {
//       for (const file of req.files.customerImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer'
//         );
//         if (upload.success) {
//           garment.customerImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     // Upload new cloth images
//     if (req.files?.customerClothImages) {
//       for (const file of req.files.customerClothImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/cloth'
//         );
//         if (upload.success) {
//           garment.customerClothImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     await garment.save();
//     console.log("✅ Garment updated successfully");

//     res.json({
//       message: "Garment updated successfully",
//       garment
//     });

//   } catch (error) {
//     console.error("❌ Update garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE GARMENT =====
// export const deleteGarment = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Delete images from R2
//     for (const img of garment.referenceImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }
//     for (const img of garment.customerImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }
//     for (const img of garment.customerClothImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }

//     // Delete associated work
//     if (garment.workId) {
//       await Work.findByIdAndUpdate(garment.workId, { isActive: false });
//     }

//     // Remove garment from order
//     await Order.findByIdAndUpdate(garment.order, {
//       $pull: { garments: garment._id }
//     });

//     garment.isActive = false;
//     await garment.save();

//     res.json({ message: "Garment deleted successfully" });
//   } catch (error) {
//     console.error("Delete garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE GARMENT IMAGES =====
// export const updateGarmentImages = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     let referenceImages = [...garment.referenceImages];
//     let customerImages = [...garment.customerImages];
//     let customerClothImages = [...(garment.customerClothImages || [])];

//     // Upload new reference images
//     if (req.files?.referenceImages) {
//       for (const file of req.files.referenceImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           referenceImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     // Upload new customer digital images
//     if (req.files?.customerImages) {
//       for (const file of req.files.customerImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer-digital'
//         );
//         if (upload.success) {
//           customerImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     // Upload new customer cloth images
//     if (req.files?.customerClothImages) {
//       for (const file of req.files.customerClothImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer-cloth'
//         );
//         if (upload.success) {
//           customerClothImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     garment.referenceImages = referenceImages;
//     garment.customerImages = customerImages;
//     garment.customerClothImages = customerClothImages;
//     await garment.save();

//     res.json({
//       message: "Garment images updated successfully",
//       garment
//     });
//   } catch (error) {
//     console.error("Update garment images error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE GARMENT IMAGE =====
// export const deleteGarmentImage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { imageKey, imageType } = req.body;

//     const garment = await Garment.findById(id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Delete from R2
//     await r2Service.deleteFile(imageKey);

//     // Remove from appropriate array
//     if (imageType === 'reference') {
//       garment.referenceImages = garment.referenceImages.filter(
//         img => img.key !== imageKey
//       );
//     } else if (imageType === 'customer') {
//       garment.customerImages = garment.customerImages.filter(
//         img => img.key !== imageKey
//       );
//     } else if (imageType === 'customerCloth') {
//       garment.customerClothImages = garment.customerClothImages.filter(
//         img => img.key !== imageKey
//       );
//     }

//     await garment.save();

//     res.json({ message: "Image deleted successfully" });
//   } catch (error) {
//     console.error("Delete garment image error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };





// controllers/garment.controller.js
import Garment from "../models/Garment.js";
import Work from "../models/Work.js";
// import User from "../models/User.js"; // ❌ REMOVE THIS - Not needed
import CuttingMaster from "../models/CuttingMaster.js"; // ✅ ADD THIS
import Order from "../models/Order.js";
import r2Service from "../services/r2.service.js";
import mongoose from "mongoose";
import { createNotification } from './notification.controller.js'; // ✅ ADD THIS

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

    // ✅ CRITICAL: Log what files are received
    console.log("📸 Files received:", {
      referenceImages: req.files?.referenceImages?.length || 0,
      customerImages: req.files?.customerImages?.length || 0,
      customerClothImages: req.files?.customerClothImages?.length || 0,
    });

    // Initialize image arrays
    let referenceImages = [];
    let customerImages = [];
    let customerClothImages = [];

    // ✅ Upload reference images to R2
    if (req.files?.referenceImages && req.files.referenceImages.length > 0) {
      console.log(`📸 Uploading ${req.files.referenceImages.length} reference images`);
      for (const file of req.files.referenceImages) {
        console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/reference'
        );
        if (upload.success) {
          referenceImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
          console.log(`   ✅ Uploaded: ${upload.url}`);
        } else {
          console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
        }
      }
    }

    // ✅ Upload customer digital images to R2
    if (req.files?.customerImages && req.files.customerImages.length > 0) {
      console.log(`📸 Uploading ${req.files.customerImages.length} customer images`);
      for (const file of req.files.customerImages) {
        console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/customer'
        );
        if (upload.success) {
          customerImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
          console.log(`   ✅ Uploaded: ${upload.url}`);
        } else {
          console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
        }
      }
    }

    // ✅ Upload customer cloth images to R2
    if (req.files?.customerClothImages && req.files.customerClothImages.length > 0) {
      console.log(`📸 Uploading ${req.files.customerClothImages.length} cloth images`);
      for (const file of req.files.customerClothImages) {
        console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/cloth'
        );
        if (upload.success) {
          customerClothImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
          console.log(`   ✅ Uploaded: ${upload.url}`);
        } else {
          console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
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

    // ✅ Create garment with all image arrays
    const garment = new Garment({
      order: orderId,
      name,
      category,
      item,
      measurementTemplate: measurementTemplate || null,
      measurementSource: measurementSource || "template",
      measurements: parsedMeasurements || [],
      referenceImages,      // ✅ This will be saved to database
      customerImages,       // ✅ This will be saved to database
      customerClothImages,  // ✅ This will be saved to database
      additionalInfo,
      estimatedDelivery,
      priority: priority || "normal",
      priceRange: parsedPriceRange || { min: 0, max: 0 },
    });

    console.log("💾 Saving garment with images:", {
      referenceImages: referenceImages.length,
      customerImages: customerImages.length,
      customerClothImages: customerClothImages.length,
    });

    await garment.save();
    
    console.log("✅ Garment created with ID:", garment._id);
    console.log("📸 Images saved in database:", {
      reference: garment.referenceImages.length,
      customer: garment.customerImages.length,
      cloth: garment.customerClothImages.length,
    });

    // ===== SMART ASSIGNMENT LOGIC =====
    console.log("🔍 Searching for cutting masters in CuttingMaster model...");
    const cuttingMasters = await CuttingMaster.find({ isActive: true });
    console.log(`✅ Found ${cuttingMasters.length} cutting masters`);

    // Generate work ID
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const workCount = await Work.countDocuments();
    const sequential = String(workCount + 1).padStart(4, '0');
    const garmentPrefix = garment.name?.substring(0, 4).toUpperCase() || 'WRK';
    const workId = `${garmentPrefix}-${day}${month}${year}-${sequential}`;

    // Base work data
    const workData = {
      workId,
      order: orderId,
      garment: garment._id,
      status: "pending",
      createdBy: userId,
      estimatedDelivery: estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
    };

    if (cuttingMasters.length === 0) {
      // Case 1: No cutting masters
      console.log("⚠️ No cutting masters found - creating work without assignment");
      
      const work = await Work.create(workData);
      console.log(`✅ Work created without assignment. ID: ${work._id}`);
      
      garment.workId = work._id;
      await garment.save();
      
    } else if (cuttingMasters.length === 1) {
      // Case 2: Single cutting master - AUTO-ASSIGN
      console.log(`✅ Single cutting master found - AUTO-ASSIGNING to ${cuttingMasters[0].name}`);
      
      workData.cuttingMaster = cuttingMasters[0]._id;
      const work = await Work.create(workData);
      console.log(`✅ Work created and AUTO-ASSIGNED! ID: ${work._id}`);
      console.log(`✂️ Assigned to: ${cuttingMasters[0].name}`);
      
      garment.workId = work._id;
      await garment.save();
      
      // Notify the assigned cutting master
      await createNotification({
        type: 'work-assigned',
        recipient: cuttingMasters[0]._id,
        title: 'New Work Auto-Assigned',
        message: `New work for ${garment.name} has been assigned to you`,
        reference: {
          orderId: orderId,
          workId: work._id,
          garmentId: garment._id
        },
        priority: 'high'
      });
      
    } else {
      // Case 3: Multiple cutting masters - create WITHOUT assignment (manual later)
      console.log(`✅ Multiple cutting masters found (${cuttingMasters.length}) - creating work for manual assignment`);
      
      const work = await Work.create(workData);
      console.log(`✅ Work created without assignment. ID: ${work._id}`);
      console.log(`👉 Work needs manual assignment to a cutting master`);
      
      garment.workId = work._id;
      await garment.save();
      
      // Notify ALL cutting masters about work needing assignment
      for (const master of cuttingMasters) {
        await createNotification({
          type: 'work-pending-assignment',
          recipient: master._id,
          title: 'New Work - Needs Assignment',
          message: `New work for ${garment.name} needs a cutting master`,
          reference: {
            orderId: orderId,
            workId: work._id,
            garmentId: garment._id
          },
          priority: 'high'
        });
      }
    }

    // Add garment to order
    await Order.findByIdAndUpdate(orderId, {
      $push: { garments: garment._id }
    });
    console.log("✅ Garment added to order");

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

    console.log(`📦 Found ${garments.length} garments for order ${orderId}`);
    garments.forEach(g => {
      console.log(`🎨 Garment ${g.garmentId}:`, {
        referenceImages: g.referenceImages?.length || 0,
        customerImages: g.customerImages?.length || 0,
        customerClothImages: g.customerClothImages?.length || 0
      });
    });

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
    const { id } = req.params;
    console.log("📝 Updating garment:", id);
    console.log("📦 Request body:", req.body);
    console.log("📸 Request files:", req.files);

    const garment = await Garment.findById(id);

    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    // Parse JSON fields from FormData
    let {
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
      status,
      existingReferenceImages,
      existingCustomerImages,
      existingClothImages
    } = req.body;

    // Parse JSON strings if they came from FormData
    if (measurements && typeof measurements === 'string') {
      try {
        measurements = JSON.parse(measurements);
      } catch (e) {
        console.error("Error parsing measurements:", e);
      }
    }

    if (priceRange && typeof priceRange === 'string') {
      try {
        priceRange = JSON.parse(priceRange);
      } catch (e) {
        console.error("Error parsing priceRange:", e);
      }
    }

    // Parse existing image keys
    let keepReferenceKeys = [];
    let keepCustomerKeys = [];
    let keepClothKeys = [];

    if (existingReferenceImages && typeof existingReferenceImages === 'string') {
      try {
        keepReferenceKeys = JSON.parse(existingReferenceImages);
      } catch (e) {
        console.error("Error parsing existingReferenceImages:", e);
      }
    }

    if (existingCustomerImages && typeof existingCustomerImages === 'string') {
      try {
        keepCustomerKeys = JSON.parse(existingCustomerImages);
      } catch (e) {
        console.error("Error parsing existingCustomerImages:", e);
      }
    }

    if (existingClothImages && typeof existingClothImages === 'string') {
      try {
        keepClothKeys = JSON.parse(existingClothImages);
      } catch (e) {
        console.error("Error parsing existingClothImages:", e);
      }
    }

    // Update basic fields
    if (name) garment.name = name;
    if (category) garment.category = category;
    if (item) garment.item = item;
    if (measurementTemplate) garment.measurementTemplate = measurementTemplate;
    if (measurementSource) garment.measurementSource = measurementSource;
    if (measurements) garment.measurements = measurements;
    if (additionalInfo !== undefined) garment.additionalInfo = additionalInfo;
    if (estimatedDelivery) garment.estimatedDelivery = estimatedDelivery;
    if (priority) garment.priority = priority;
    if (priceRange) garment.priceRange = priceRange;
    if (status) garment.status = status;

    // Handle images - keep only those not deleted
    if (keepReferenceKeys.length > 0) {
      garment.referenceImages = garment.referenceImages.filter(img => 
        keepReferenceKeys.includes(img.key)
      );
    } else {
      garment.referenceImages = []; // Remove all if none to keep
    }

    if (keepCustomerKeys.length > 0) {
      garment.customerImages = garment.customerImages.filter(img => 
        keepCustomerKeys.includes(img.key)
      );
    } else {
      garment.customerImages = [];
    }

    if (keepClothKeys.length > 0) {
      garment.customerClothImages = garment.customerClothImages.filter(img => 
        keepClothKeys.includes(img.key)
      );
    } else {
      garment.customerClothImages = [];
    }

    // Upload new reference images
    if (req.files?.referenceImages) {
      for (const file of req.files.referenceImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/reference'
        );
        if (upload.success) {
          garment.referenceImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
        }
      }
    }

    // Upload new customer images
    if (req.files?.customerImages) {
      for (const file of req.files.customerImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/customer'
        );
        if (upload.success) {
          garment.customerImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
        }
      }
    }

    // Upload new cloth images
    if (req.files?.customerClothImages) {
      for (const file of req.files.customerClothImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/cloth'
        );
        if (upload.success) {
          garment.customerClothImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
        }
      }
    }

    await garment.save();
    console.log("✅ Garment updated successfully");

    res.json({
      message: "Garment updated successfully",
      garment
    });

  } catch (error) {
    console.error("❌ Update garment error:", error);
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

    // Delete images from R2
    for (const img of garment.referenceImages) {
      if (img.key) await r2Service.deleteFile(img.key);
    }
    for (const img of garment.customerImages) {
      if (img.key) await r2Service.deleteFile(img.key);
    }
    for (const img of garment.customerClothImages) {
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
    let customerClothImages = [...(garment.customerClothImages || [])];

    // Upload new reference images
    if (req.files?.referenceImages) {
      for (const file of req.files.referenceImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/reference'
        );
        if (upload.success) {
          referenceImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    // Upload new customer digital images
    if (req.files?.customerImages) {
      for (const file of req.files.customerImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/customer-digital'
        );
        if (upload.success) {
          customerImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    // Upload new customer cloth images
    if (req.files?.customerClothImages) {
      for (const file of req.files.customerClothImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/customer-cloth'
        );
        if (upload.success) {
          customerClothImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    garment.referenceImages = referenceImages;
    garment.customerImages = customerImages;
    garment.customerClothImages = customerClothImages;
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
    const { imageKey, imageType } = req.body;

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
    } else if (imageType === 'customerCloth') {
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