import express from "express";
import {
  sendMessage,
  getMessageThread,
} from "../controllers/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, sendMessage);
router.get("/thread/:userId", authMiddleware, getMessageThread);

export default router;
