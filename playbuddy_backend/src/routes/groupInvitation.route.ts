import express from "express";

import {
  getAllUserGroupInvitations,
  getGroupInvitationById,
  rejectGroupInvitation,
} from "../controllers/groupInvitation.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", protectRoute, getAllUserGroupInvitations);
router.get("/:invitationId", protectRoute, getGroupInvitationById);

router.post("/:invitationId/reject", protectRoute, rejectGroupInvitation);

export default router;
