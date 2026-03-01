import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../Models/User.js";

dotenv.config();

// Middleware to authenticate the user using JWT token
export const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      message: "Error while validating the token",
    });
  }
};

// Middleware to allow only Member
export const isMember = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "MEMBER") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Member only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying Member access",
    });
  }
};

// Middleware to allow only MANAGER
export const isManager = async (req, res, next) => {
  try {
    if (req.user.role !== "MANAGER") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Manager only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying Manager access",
    });
  }
};

// Middleware to allow only Admins
export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admins only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying admin access",
    });
  }
};

export const isAdminOrManager = (req, res, next) => {
  if (req.user.role === "ADMIN" || req.user.role === "MANAGER") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied: Admin or Manager only",
  });
};