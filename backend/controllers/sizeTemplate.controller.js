import SizeTemplate from "../models/SizeTemplate.js";

// ========== CREATE TEMPLATE ==========
export const createTemplate = async (req, res) => {
  try {
    const { name, description, sizeFields } = req.body;

    // Check if template exists
    const existing = await SizeTemplate.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Template with this name already exists" });
    }

    const template = await SizeTemplate.create({
      name,
      description,
      sizeFields,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Template created successfully",
      template
    });
  } catch (error) {
    console.error("Create template error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== GET ALL TEMPLATES (with pagination) ==========
export const getAllTemplates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const includeInactive = req.query.includeInactive === 'true'; // ✅ Admin only

    // Build query
    let query = {};
    
    // Add search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Only filter by isActive if not including inactive
    if (!includeInactive) {
      query.isActive = true;
    }

    console.log(`📡 Fetching templates - Page: ${page}, Include Inactive: ${includeInactive}`);

    const total = await SizeTemplate.countDocuments(query);
    const templates = await SizeTemplate.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "name email");

    res.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== GET SINGLE TEMPLATE ==========
export const getTemplateById = async (req, res) => {
  try {
    const template = await SizeTemplate.findById(req.params.id)
      .populate("createdBy", "name email");
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(template);
  } catch (error) {
    console.error("Get template error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== UPDATE TEMPLATE ==========
export const updateTemplate = async (req, res) => {
  try {
    const { name, description, sizeFields, isActive } = req.body;
    
    const template = await SizeTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check name uniqueness if changed
    if (name && name !== template.name) {
      const existing = await SizeTemplate.findOne({ name });
      if (existing) {
        return res.status(400).json({ message: "Template with this name already exists" });
      }
    }

    template.name = name || template.name;
    template.description = description !== undefined ? description : template.description;
    template.sizeFields = sizeFields || template.sizeFields;
    template.isActive = isActive !== undefined ? isActive : template.isActive;

    await template.save();

    res.json({
      message: "Template updated successfully",
      template
    });
  } catch (error) {
    console.error("Update template error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== DELETE TEMPLATE (Soft delete) ==========
export const deleteTemplate = async (req, res) => {
  try {
    const template = await SizeTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Soft delete
    template.isActive = false;
    await template.save();

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Delete template error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== TOGGLE TEMPLATE STATUS ==========
export const toggleTemplateStatus = async (req, res) => {
  try {
    const template = await SizeTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    template.isActive = !template.isActive;
    await template.save();

    res.json({ 
      message: `Template ${template.isActive ? 'activated' : 'deactivated'}`,
      isActive: template.isActive 
    });
  } catch (error) {
    console.error("Toggle template error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== HARD DELETE (Permanent - Admin only) ==========
export const hardDeleteTemplate = async (req, res) => {
  try {
    const template = await SizeTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    await SizeTemplate.findByIdAndDelete(req.params.id);

    res.json({ 
      message: "Template permanently deleted",
      deletedTemplate: {
        id: template._id,
        name: template.name
      }
    });
  } catch (error) {
    console.error("Hard delete template error:", error);
    res.status(500).json({ message: error.message });
  }
};