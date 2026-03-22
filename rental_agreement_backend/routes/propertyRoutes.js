const express = require("express");
const router = express.Router();
const {
  addProperty,
  getProperties,
  getProperty,
  getMyProperties,
  updateProperty
} = require("../controllers/propertyController");
const { protect, landlordOnly } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

router.get("/", getProperties);
router.get("/my", protect, landlordOnly, getMyProperties);
router.get("/:id", getProperty);
router.post("/", protect, landlordOnly, 
  upload.array("images", 5), addProperty);
router.put("/:id", protect, landlordOnly, updateProperty);

module.exports = router;