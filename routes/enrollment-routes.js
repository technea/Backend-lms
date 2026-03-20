import express from "express";
import { getEnrollments, getEnrollmentById, createEnrollment, getMyEnrollments, updateEnrollment, deleteEnrollment } from "../controllers/enrollment-controller.js";
import { protect, adminRoles } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/", protect, adminRoles, getEnrollments);
router.get("/my-courses", protect, getMyEnrollments);
router.get("/:id", protect, getEnrollmentById);
router.post("/", protect, createEnrollment);
router.put("/:id", protect, updateEnrollment);
router.delete("/:id", protect, adminRoles, deleteEnrollment);

export default router;