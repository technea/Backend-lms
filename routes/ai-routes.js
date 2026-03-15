import express from "express";
import { getAIResponse } from "../controllers/ai-controller.js";
import { protect } from "../middleware/auth-middleware.js";

const router = express.Router();

// Only logged in users can chat with AI
router.post("/chat", protect, getAIResponse);

export default router;
