const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Property = require("../models/Property");
const Agreement = require("../models/Agreement");

// ─────────────────────────────────────────────
// Helper: sign admin JWT
// ─────────────────────────────────────────────
const generateAdminToken = (admin) => {
  return jwt.sign(
    { id: admin._id, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ─────────────────────────────────────────────
// POST /api/admin/login
// ─────────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      isSuperAdmin: admin.isSuperAdmin,
      token: generateAdminToken(admin),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/me
// ─────────────────────────────────────────────
const getAdminProfile = async (req, res) => {
  res.json(req.admin);
};

// ─────────────────────────────────────────────
// GET /api/admin/users
// ─────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    const filter = {};

    if (role && role !== "all") filter.role = role;
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    // Attach agreement counts
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const agreementCount = await Agreement.countDocuments({
          $or: [{ landlord: u._id }, { tenant: u._id }],
        });
        const propertyCount =
          u.role === "landlord"
            ? await Property.countDocuments({ landlord: u._id })
            : 0;
        return { ...u.toObject(), agreementCount, propertyCount };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// PUT /api/admin/users/:id/status
// ─────────────────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: `User ${isActive ? "activated" : "deactivated"}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/properties
// ─────────────────────────────────────────────
const getAllProperties = async (req, res) => {
  try {
    const { search, available } = req.query;
    const filter = {};

    if (available === "true") filter.isAvailable = true;
    if (available === "false") filter.isAvailable = false;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const properties = await Property.find(filter)
      .populate("landlord", "name email")
      .populate("currentTenant", "name email")
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/admin/properties/:id
// ─────────────────────────────────────────────
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    res.json({ message: "Property removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/agreements
// ─────────────────────────────────────────────
const getAllAgreements = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") filter.status = status;

    const agreements = await Agreement.find(filter)
      .populate("property", "title location roomType")
      .populate("landlord", "name email walletAddress")
      .populate("tenant", "name email walletAddress")
      .sort({ createdAt: -1 });

    let result = agreements;
    if (search) {
      const s = search.toLowerCase();
      result = agreements.filter(
        (a) =>
          a.property?.title?.toLowerCase().includes(s) ||
          a.landlord?.name?.toLowerCase().includes(s) ||
          a.tenant?.name?.toLowerCase().includes(s)
      );
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/disputes
// ─────────────────────────────────────────────
const getActiveDisputes = async (req, res) => {
  try {
    const disputes = await Agreement.find({ disputeActive: true })
      .populate("property", "title location roomType")
      .populate("landlord", "name email walletAddress")
      .populate("tenant", "name email walletAddress")
      .sort({ updatedAt: -1 });

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// PUT /api/admin/agreements/:id/resolve-dispute
// ─────────────────────────────────────────────
const resolveDisputeAdmin = async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });
    if (!agreement.disputeActive)
      return res.status(400).json({ message: "No active dispute" });

    agreement.disputeActive = false;
    agreement.disputeReason = "";
    await agreement.save();

    res.json({ message: "Dispute resolved by admin", agreement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/stats
// ─────────────────────────────────────────────
const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLandlords,
      totalTenants,
      totalProperties,
      availableProperties,
      totalAgreements,
      activeAgreements,
      pendingAgreements,
      activeDisputes,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "landlord" }),
      User.countDocuments({ role: "tenant" }),
      Property.countDocuments(),
      Property.countDocuments({ isAvailable: true }),
      Agreement.countDocuments(),
      Agreement.countDocuments({ status: "active" }),
      Agreement.countDocuments({ status: "pending" }),
      Agreement.countDocuments({ disputeActive: true }),
      Agreement.aggregate([
        { $match: { status: { $in: ["active", "expired", "terminated"] } } },
        { $group: { _id: null, total: { $sum: "$rentAmount" } } },
      ]),
    ]);

    // Monthly agreement counts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyData = await Agreement.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$rentAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      users: { total: totalUsers, landlords: totalLandlords, tenants: totalTenants },
      properties: { total: totalProperties, available: availableProperties, occupied: totalProperties - availableProperties },
      agreements: { total: totalAgreements, active: activeAgreements, pending: pendingAgreements, disputes: activeDisputes },
      revenue: revenueAgg[0]?.total || 0,
      monthlyData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  adminLogin,
  getAdminProfile,
  getAllUsers,
  toggleUserStatus,
  getAllProperties,
  deleteProperty,
  getAllAgreements,
  getActiveDisputes,
  resolveDisputeAdmin,
  getPlatformStats,
};
