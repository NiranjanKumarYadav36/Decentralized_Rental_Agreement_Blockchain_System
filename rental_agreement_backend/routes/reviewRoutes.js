const express = require("express");
const router = express.Router();
const { addReview, getPropertyReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.post("/", protect, addReview);
router.get("/:propertyId", getPropertyReviews);

module.exports = router;
