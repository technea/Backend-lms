import express from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, registerUser, loginUser, changePassword, forgotPassword, resetPassword, updateAvatar, verifyOTP, resendOTP } from "../controllers/user-controller.js";
import { protect, adminRoles } from "../middleware/auth-middleware.js";
import upload from "../middleware/upload-middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/avatar", protect, upload.single('avatar'), updateAvatar);

// Administrative routes
router.get("/", protect, adminRoles, getUsers);
router.get("/:id", protect, adminRoles, getUserById);
router.post("/", protect, adminRoles, createUser);
router.put("/change-password", protect, changePassword);
router.put("/:id", protect, adminRoles, updateUser);
router.delete("/:id", protect, adminRoles, deleteUser);

export default router;
