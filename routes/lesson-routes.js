import express from "express"
import { getLessonsByCourse, getLessonById, createLesson, updateLesson, deleteLesson } from "../controllers/lesson-controller.js"
import { protect, instructorRoles } from "../middleware/auth-middleware.js"
import upload from "../middleware/upload-middleware.js"

const router = express.Router()

router.get("/course/:courseId", getLessonsByCourse)
router.get("/:id", getLessonById)

// Protected routes for Instructors / Admins
router.post("/", protect, instructorRoles, upload.single('video'), createLesson)
router.put("/:id", protect, instructorRoles, updateLesson)
router.delete("/:id", protect, instructorRoles, deleteLesson)

export default router
