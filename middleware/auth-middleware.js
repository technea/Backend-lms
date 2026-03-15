import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 1. Authentication Middleware: Check if user is logged in
export const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");
            
            req.user = await User.findById(decoded.id).select("-password");
            if (!req.user) {
                return res.status(401).json({ message: "The user belonging to this token no longer exists." });
            }
            next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed or expired" });
        }
    }
    
    if (!token) {
        return res.status(401).json({ message: "You are not logged in! Please login to get access." });
    }
};

// 2. Authorization Middleware: Check if user has required role
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles = ['admin', 'instructor']
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "You do not have permission to perform this action" 
            });
        }
        next();
    };
};

// Fallback old versions for compatibility while we transition
export const adminRoles = restrictTo('admin');
export const instructorRoles = restrictTo('admin', 'instructor');

