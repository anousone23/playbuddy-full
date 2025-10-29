import { Router } from "express";

import {
  createSportType,
  deleteSportType,
  getAllSportTypes,
  updateSportType,
} from "../controllers/admin.controller/sportType.admin.controller";
import {
  protectAdminRoute,
  protectRoute,
} from "../middlewares/auth.middleware";

const router = Router();

router.get("/", protectRoute, getAllSportTypes);

router.post("/", protectRoute, protectAdminRoute, createSportType);

router.put("/:sportTypeId", protectRoute, protectAdminRoute, updateSportType);

router.delete(
  "/:sportTypeId",
  protectRoute,
  protectAdminRoute,
  deleteSportType
);

export default router;
