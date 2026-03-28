const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, walletAddress } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "tenant",
      phone: phone || "",
      walletAddress: walletAddress?.trim() || null
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
      isZkVerified: user.isZkVerified,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.log("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    const user = await User.findOne({ email });
    console.log("User found:", user ? "yes" : "no");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
      isZkVerified: user.isZkVerified,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Wallet
const updateWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    // Check if wallet already exists for another user
    const existingUser = await User.findOne({ walletAddress });

    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Wallet already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { walletAddress: walletAddress?.trim() || null },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify ZK Proof (Simulated for Prototype)
const verifyZk = async (req, res) => {
  try {
    const { proof, nullifier } = req.body;

    // In a real implementation with Worldcoin/Sismo:
    // const response = await axios.post("https://developer.worldcoin.org/api/v1/verify", { ... });
    
    // For this prototype, we simulate a successful ZK verification 
    // if a proof string is provided.
    if (!proof || !nullifier) {
      return res.status(400).json({ message: "Invalid ZK proof or nullifier" });
    }

    // Check if nullifier already used
    const existing = await User.findOne({ zkNullifier: nullifier });
    if (existing && existing._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Identity already verified by another account" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        isZkVerified: true, 
        zkNullifier: nullifier 
      },
      { new: true }
    ).select("-password");

    res.json({
      message: "ZK Identity Verified successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, updateWallet, verifyZk };