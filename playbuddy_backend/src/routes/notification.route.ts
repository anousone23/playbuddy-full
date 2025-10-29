import express from "express";

import {
  getAllNotifications,
  markNotificationAsRead,
} from "../controllers/notification.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", protectRoute, getAllNotifications);

router.put("/mark-as-read", protectRoute, markNotificationAsRead);

export default router;
