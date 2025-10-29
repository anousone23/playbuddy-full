import express from "express";

import {
  acceptFriendRequest,
  getAllFriendRequests,
  getFriendRequestById,
  rejectFriendRequest,
} from "../controllers/friendRequest.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", protectRoute, getAllFriendRequests);
router.get("/:requestId", protectRoute, getFriendRequestById);

router.post("/:requestId/accept", protectRoute, acceptFriendRequest);
router.post("/:requestId/reject", protectRoute, rejectFriendRequest);

export default router;
