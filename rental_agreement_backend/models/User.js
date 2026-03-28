const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String,
    default: null,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ["landlord", "tenant"],
    default: "tenant"
  },
  phone: {
    type: String,
    default: ""
  },
  profileImage: {
    type: String,
    default: ""
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isZkVerified: {
    type: Boolean,
    default: false
  },
  zkNullifier: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);