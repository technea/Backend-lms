import express from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, registerUser, loginUser, changePassword, forgotPassword, resetPassword, updateAvatar, verifyOTP, resendOTP, setup2FA, verifyAndEnable2FA, loginWith2FA, disable2FA } from "../controllers/user-controller.js";
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
router.get("/2fa/setup", protect, setup2FA);
router.post("/2fa/verify", protect, verifyAndEnable2FA);
router.post("/2fa/login", loginWith2FA);
router.post("/2fa/disable", protect, disable2FA);

// Administrative routes
router.get("/", protect, adminRoles, getUsers);
router.get("/:id", protect, adminRoles, getUserById);
router.post("/", protect, adminRoles, createUser);
router.put("/change-password", protect, changePassword);
router.put("/:id", protect, adminRoles, updateUser);
router.delete("/:id", protect, adminRoles, deleteUser);

export default router;
