const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  contractAddress: {
    type: String,
    default: ""
  },
  rentAmount: {
    type: Number,
    required: true
  },
  depositAmount: {
    type: Number,
    required: true
  },
  durationDays: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ["pending", "approved", "active", "expired", "terminated", "rejected"],
    default: "pending"
  },
  disputeActive: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String,
    default: ""
  },
  txHash: {
    type: String,
    default: ""
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("Agreement", agreementSchema);