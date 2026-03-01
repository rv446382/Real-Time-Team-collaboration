import jwt from "jsonwebtoken";
import User from "../Models/User.js";

// 🔐 AUTH MIDDLEWARE
export const auth = async (req, res, next) => {
  try {
    let token;

    // ✅ Safe cookie access
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // ✅ Body token support
    else if (req.body && req.body.token) {
      token = req.body.token;
    }
    // ✅ Bearer token support
    else if (req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    // ✅ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch fresh user from DB (safer than trusting decoded only)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};



// 👤 ROLE CHECKS

export const isMember = (req, res, next) => {
  if (!req.user || req.user.role !== "MEMBER") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Member only",
    });
  }
  next();
};

export const isManager = (req, res, next) => {
  if (!req.user || req.user.role !== "MANAGER") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Manager only",
    });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admin only",
    });
  }
  next();
};

export const isAdminOrManager = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  if (req.user.role === "ADMIN" || req.user.role === "MANAGER") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied: Admin or Manager only",
  });
};