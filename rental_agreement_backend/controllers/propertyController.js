const Property = require("../models/Property");
const cloudinary = require("cloudinary").v2;
const { uploadToCloudinary } = require("../config/cloudinary");

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Add Property (Landlord only)
const addProperty = async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const {
      title, description, location,
      rentAmount, depositAmount,
      roomType, amenities
    } = req.body;

    if (!title || !description || !location ||
        !rentAmount || !depositAmount || !roomType) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Upload images to Cloudinary
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        images.push(result.secure_url);
      }
    }

    const property = await Property.create({
      landlord: req.user._id,
      title,
      description,
      location,
      rentAmount: Number(rentAmount),
      depositAmount: Number(depositAmount),
      roomType,
      amenities: amenities
        ? amenities.split(",").map((a) => a.trim())
        : [],
      images
    });

    res.status(201).json(property);

  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Available Properties
const getProperties = async (req, res) => {
  try {
    const { roomType, location, minRent, maxRent } = req.query;
    
    let filter = { isAvailable: true };
    
    if (roomType) filter.roomType = roomType;
    if (location) filter.location = new RegExp(location, "i");
    if (minRent || maxRent) {
      filter.rentAmount = {};
      if (minRent) filter.rentAmount.$gte = Number(minRent);
      if (maxRent) filter.rentAmount.$lte = Number(maxRent);
    }

    const properties = await Property.find(filter)
      .populate("landlord", "name email phone walletAddress")
      .sort({ createdAt: -1 });

    res.json(properties);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Property
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("landlord", "name email phone walletAddress")
      .populate("currentTenant", "name email walletAddress");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Landlord Properties
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id })
      .populate("currentTenant", "name email walletAddress")
      .sort({ createdAt: -1 });

    res.json(properties);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Property
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  addProperty,
  getProperties,
  getProperty,
  getMyProperties,
  updateProperty, 
  deleteProperty,
};

