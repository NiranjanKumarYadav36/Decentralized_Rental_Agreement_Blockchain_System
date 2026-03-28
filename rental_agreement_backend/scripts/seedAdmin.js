/**
 * Run once to create the first admin account:
 *   node scripts/seedAdmin.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const path = require("path");
dotenv.config({ path: path.join(__dirname, "../.env") });

const Admin = require("../models/Admin");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await Admin.findOne({ email: "admin@rentalapp.com" });
    if (existing) {
      console.log("⚠️  Admin already exists:", existing.email);
      process.exit(0);
    }

    const admin = await Admin.create({
      name: "Super Admin",
      email: "admin@rentalapp.com",
      password: "Admin@1234",   // ← change this after first login
      isSuperAdmin: true,
    });

    console.log("🎉 Admin created successfully!");
    console.log("   Email   :", admin.email);
    console.log("   Password: Admin@1234");
    console.log("   ID      :", admin._id);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
    process.exit(1);
  }
};

seedAdmin();
