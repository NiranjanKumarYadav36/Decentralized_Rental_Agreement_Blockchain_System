const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Admin access denied: no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Must have isAdmin flag in payload
    if (!decoded.isAdmin) {
      return res
        .status(403)
        .json({ message: "Admin access denied: not an admin token" });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Admin token invalid" });
  }
};

module.exports = { adminProtect };
