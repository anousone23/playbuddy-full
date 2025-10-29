import { Router } from "express";

import {
  getAllLocations,
  getGroupChatNumberInLocation,
  getLocationById,
  getLocationSportTypes,
} from "../controllers/location.controller";
import {
  protectAdminRoute,
  protectRoute,
} from "../middlewares/auth.middleware";
import {
  createLocation,
  deleteLocation,
  getAllLocationsAdmin,
  updateLocation,
} from "../controllers/admin.controller/location.admin.controller";

const router = Router();

// user
router.get("/", protectRoute, getAllLocations);
router.get("/admin", protectRoute, protectAdminRoute, getAllLocationsAdmin);
router.get("/:locationId", protectRoute, getLocationById);
router.get("/:locationId/sportTypes", protectRoute, getLocationSportTypes);
router.get(
  "/:locationId/groupChat-count",
  protectRoute,
  getGroupChatNumberInLocation
);

// admin

router.post("/", protectRoute, protectAdminRoute, createLocation);

router.put("/:locationId", protectRoute, protectAdminRoute, updateLocation);

router.delete("/:locationId", protectRoute, protectAdminRoute, deleteLocation);

export default router;
