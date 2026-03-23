const Agreement = require("../models/Agreement");
const Property = require("../models/Property");

// Tenant requests agreement
const requestAgreement = async (req, res) => {
  try {
    const { propertyId, durationDays } = req.body;

    // Get property details
    const property = await Property.findById(propertyId)
      .populate("landlord");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (!property.isAvailable) {
      return res.status(400).json({ message: "Property not available" });
    }

    // Check if tenant already has pending agreement for this property
    const existing = await Agreement.findOne({
      property: propertyId,
      tenant: req.user._id,
      status: { $in: ["pending", "approved", "active"] }
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have an agreement for this property"
      });
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (durationDays || 30));

    const agreement = await Agreement.create({
      property: propertyId,
      landlord: property.landlord._id,
      tenant: req.user._id,
      rentAmount: property.rentAmount,
      depositAmount: property.depositAmount,
      durationDays: durationDays || 30,
      endDate,
      status: "pending"
    });

    const populated = await Agreement.findById(agreement._id)
      .populate("property", "title location images roomType")
      .populate("landlord", "name email walletAddress")
      .populate("tenant", "name email walletAddress");

    res.status(201).json(populated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Landlord gets all agreement requests
const getLandlordAgreements = async (req, res) => {
  try {
    const agreements = await Agreement.find({ landlord: req.user._id })
      .populate("property", "title location images roomType")
      .populate("tenant", "name email phone walletAddress")
      .sort({ createdAt: -1 });

    res.json(agreements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tenant gets their agreements
const getTenantAgreements = async (req, res) => {
  try {
    const agreements = await Agreement.find({ tenant: req.user._id })
      .populate("property", "title location images roomType")
      .populate("landlord", "name email phone walletAddress")
      .sort({ createdAt: -1 });

    res.json(agreements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Landlord approves agreement and saves contract address
const approveAgreement = async (req, res) => {
  try {
    const { contractAddress, txHash } = req.body;
    const agreement = await Agreement.findById(req.params.id);

    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    if (agreement.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update agreement
    agreement.status = "approved";
    agreement.contractAddress = contractAddress;
    agreement.txHash = txHash || "";
    await agreement.save();

    // Update property with contract address
    await Property.findByIdAndUpdate(agreement.property, {
      contractAddress,
      currentTenant: agreement.tenant,
      isAvailable: false    // ← ADD THIS
    });

    const populated = await Agreement.findById(agreement._id)
      .populate("property", "title location images roomType")
      .populate("tenant", "name email walletAddress")
      .populate("landlord", "name email walletAddress");

    res.json(populated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update agreement status (active, terminated etc)
const updateAgreementStatus = async (req, res) => {
  try {
    const { status, disputeActive, disputeReason } = req.body;
    const agreement = await Agreement.findById(req.params.id);

    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    if (status !== undefined) agreement.status = status;
    if (disputeActive !== undefined) agreement.disputeActive = disputeActive;
    if (disputeReason !== undefined) agreement.disputeReason = disputeReason;

    await agreement.save();

    if (status === "terminated") {
      await Property.findByIdAndUpdate(agreement.property, {
        isAvailable: true,
        contractAddress: "",
        currentTenant: null
      });
    }

    res.json(agreement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single agreement
const getAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id)
      .populate("property", "title location images roomType rentAmount depositAmount")
      .populate("landlord", "name email phone walletAddress")
      .populate("tenant", "name email phone walletAddress");

    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    res.json(agreement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestAgreement,
  getLandlordAgreements,
  getTenantAgreements,
  approveAgreement,
  updateAgreementStatus,
  getAgreement
};