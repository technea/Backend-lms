import express from "express";
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse } from "../controllers/course-controller.js";
import { protect, instructorRoles } from "../middleware/auth-middleware.js";
import upload from "../middleware/upload-middleware.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:id", getCourseById);

// Protected routes for Instructors / Admins
router.post("/", protect, instructorRoles, upload.single('video'), createCourse);
router.put("/:id", protect, instructorRoles, updateCourse);
router.delete("/:id", protect, instructorRoles, deleteCourse);

export default router;