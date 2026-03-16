import express from "express";
import { getAIResponse } from "../controllers/ai-controller.js";
import { protect } from "../middleware/auth-middleware.js";

const router = express.Router();

// Public route to allow guests to inquire about courses
router.post("/chat", getAIResponse);

export default router;
