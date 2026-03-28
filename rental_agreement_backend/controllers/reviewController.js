const Review = require("../models/Review");
const Agreement = require("../models/Agreement");

// @desc    Add a review for a property
// @route   POST /api/reviews
// @access  Private (Tenants with active/expired/terminated agreements)
exports.addReview = async (req, res) => {
  try {
    const { property, rating, comment } = req.body;
    const userId = req.user.id;

    // 1. Check if user is a tenant
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Only tenants can post reviews." });
    }

    // 2. Check for eligibility: active, expired, or terminated agreement
    const agreement = await Agreement.findOne({
      property,
      tenant: userId,
      status: { $in: ["active", "expired", "terminated"] }
    });

    if (!agreement) {
      return res.status(403).json({ 
        message: "You are only eligible to review properties where you have an active, expired, or terminated agreement." 
      });
    }

    // 3. Check if user already reviewed this property
    const existingReview = await Review.findOne({ property, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this property." });
    }

    const review = await Review.create({
      property,
      user: userId,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/:propertyId
// @access  Public
exports.getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate("user", "name")
      .sort("-createdAt");
      
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
