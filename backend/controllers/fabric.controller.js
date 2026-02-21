import Fabric from "../models/Fabric.js";
import r2Service from "../services/r2.service.js";

// CREATE
export const createFabric = async (req, res) => {
  try {
    const { name, color, pricePerMeter } = req.body;
    let imageUrl = null, imageKey = null;

    if (req.file) {
      const upload = await r2Service.uploadFile(req.file, req.file.originalname);
      if (upload.success) {
        imageUrl = upload.url;
        imageKey = upload.key;
      }
    }

    const fabric = await Fabric.create({
      name, color,
      pricePerMeter: parseFloat(pricePerMeter),
      imageUrl, imageKey
    });

    res.status(201).json({ message: "Fabric created", fabric });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL
export const getAllFabrics = async (req, res) => {
  try {
    const fabrics = await Fabric.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(fabrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET BY ID
export const getFabricById = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) return res.status(404).json({ message: "Fabric not found" });
    res.json(fabric);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) return res.status(404).json({ message: "Fabric not found" });

    if (req.file) {
      if (fabric.imageKey) await r2Service.deleteFile(fabric.imageKey);
      const upload = await r2Service.uploadFile(req.file, req.file.originalname);
      if (upload.success) {
        fabric.imageUrl = upload.url;
        fabric.imageKey = upload.key;
      }
    }

    const { name, color, pricePerMeter } = req.body;
    if (name) fabric.name = name;
    if (color) fabric.color = color;
    if (pricePerMeter) fabric.pricePerMeter = parseFloat(pricePerMeter);

    await fabric.save();
    res.json({ message: "Fabric updated", fabric });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE (Soft)
export const deleteFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) return res.status(404).json({ message: "Fabric not found" });

    if (fabric.imageKey) await r2Service.deleteFile(fabric.imageKey);
    fabric.isActive = false;
    await fabric.save();

    res.json({ message: "Fabric deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE STATUS
export const toggleFabricStatus = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) return res.status(404).json({ message: "Fabric not found" });
    
    fabric.isActive = !fabric.isActive;
    await fabric.save();
    
    res.json({ message: `Fabric ${fabric.isActive ? 'activated' : 'deactivated'}`, isActive: fabric.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};