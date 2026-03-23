const express = require("express");
const router = express.Router();
const {
  requestAgreement,
  getLandlordAgreements,
  getTenantAgreements,
  approveAgreement,
  updateAgreementStatus,
  getAgreement
} = require("../controllers/agreementController");
const { protect, landlordOnly } = require("../middleware/auth");

// Tenant routes
router.post("/request", protect, requestAgreement);
router.get("/my", protect, getTenantAgreements);

// Landlord routes
router.get("/requests", protect, landlordOnly, getLandlordAgreements);
router.put("/:id/approve", protect, landlordOnly, approveAgreement);

// Shared routes
router.get("/:id", protect, getAgreement);
router.put("/:id/status", protect, updateAgreementStatus);

module.exports = router;