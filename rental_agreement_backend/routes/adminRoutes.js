const express = require("express");
const router = express.Router();
const { adminProtect } = require("../middleware/adminAuth");
const {
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
} = require("../controllers/adminController");

// Public
router.post("/login", adminLogin);

// Protected (all below require admin token)
router.use(adminProtect);

router.get("/me", getAdminProfile);
router.get("/stats", getPlatformStats);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:id/status", toggleUserStatus);

// Property Oversight
router.get("/properties", getAllProperties);
router.delete("/properties/:id", deleteProperty);

// Agreement Oversight
router.get("/agreements", getAllAgreements);

// Dispute Monitor
router.get("/disputes", getActiveDisputes);
router.put("/agreements/:id/resolve-dispute", resolveDisputeAdmin);

module.exports = router;
