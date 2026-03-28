const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateWallet,
  verifyZk
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/wallet", protect, updateWallet);
router.post("/verify-zk", protect, verifyZk);

module.exports = router;