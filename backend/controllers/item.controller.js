import Item from "../models/Item.js";

// CREATE
export const createItem = async (req, res) => {
  try {
    const item = await Item.create({
      name: req.body.name,
      category: req.body.categoryId
    });
    await item.populate("category");
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL (with optional category filter)
export const getItems = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.categoryId) filter.category = req.query.categoryId;
    
    const items = await Item.find(filter)
      .populate("category")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET BY ID
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("category");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    ).populate("category");
    
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE (Soft)
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE STATUS
export const toggleItemStatus = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    
    item.isActive = !item.isActive;
    await item.save();
    
    res.json({ message: `Item ${item.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};