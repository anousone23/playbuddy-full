import express from "express";

import { protectRoute } from "../middlewares/auth.middleware";
import {
  getAllUserDirectChats,
  getDirectChatById,
} from "../controllers/directChat.controller";
import {
  getAllUserDirectMessages,
  sendDirectMessage,
} from "../controllers/directMessage.controller";

const router = express.Router();

router.get("/", protectRoute, getAllUserDirectChats);
router.get("/:directChatId", protectRoute, getDirectChatById);
router.get("/:directChatId/messages", protectRoute, getAllUserDirectMessages);

router.post("/:directChatId/send-message", protectRoute, sendDirectMessage);

export default router;
