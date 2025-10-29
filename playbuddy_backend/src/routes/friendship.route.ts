import express from "express";

import { protectRoute } from "../middlewares/auth.middleware";
import {
  getAllUserFriends,
  unfriend,
} from "../controllers/friendship.controller";

const router = express.Router();

router.get("/", protectRoute, getAllUserFriends);

router.delete("/:friendshipId", protectRoute, unfriend);

export default router;
