const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    console.log("Headers:", req.headers.authorization);

    if (req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token found:", token ? "yes" : "no");
    }

    if (!token) {
      return res.status(401).json({ 
        message: "Not authorized, no token" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);
    
    req.user = await User.findById(decoded.id).select("-password");
    console.log("User from DB:", req.user);
    
    next();

  } catch (error) {
    console.log("Auth error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};

const landlordOnly = (req, res, next) => {
  console.log("Role check:", req.user?.role);
  if (req.user && req.user.role === "landlord") {
    next();
  } else {
    res.status(403).json({ message: "Landlord access only" });
  }
};

module.exports = { protect, landlordOnly };