import express from "express";
import { getAdminAnalytics } from "../controllers/admin-controller.js";
import { protect, adminRoles } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/analytics", protect, adminRoles, getAdminAnalytics);

export default router;
