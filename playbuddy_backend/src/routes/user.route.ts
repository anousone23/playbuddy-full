import express from "express";

import {
  acknowledgeReport,
  cancelAccountSuspension,
  getAllUserReports,
  getAllUsers,
  getDashboardData,
  getReportedUsers,
  getUserFriendNumber,
  getUserGroupChatNumber,
  getUsersById,
  suspendAccount,
  updateProfileAdmin,
} from "../controllers/admin.controller/user.admin.controller";
import {
  addFriend,
  deactivateAccount,
  getUsersByName,
  reportUser,
  updateFcmToken,
  updateProfile,
} from "../controllers/user.controller";
import {
  protectAdminRoute,
  protectRoute,
} from "../middlewares/auth.middleware";

const router = express.Router();

// admin
router.get("/", protectRoute, protectAdminRoute, getAllUsers);
router.get("/reports", protectRoute, protectAdminRoute, getReportedUsers);
router.get("/dashboard", protectRoute, protectAdminRoute, getDashboardData);
router.get("/:userId", protectRoute, protectAdminRoute, getUsersById);
router.get(
  "/:userId/reports",
  protectRoute,
  protectAdminRoute,
  getAllUserReports
);
router.get(
  "/:userId/joined-groupchat-number",
  protectRoute,
  protectAdminRoute,
  getUserGroupChatNumber
);
router.get(
  "/:userId/friend-number",
  protectRoute,
  protectAdminRoute,
  getUserFriendNumber
);

router.post(
  "/:userId/suspend",
  protectRoute,
  protectAdminRoute,
  suspendAccount
);
router.post(
  "/:userId/cancel-suspend",
  protectRoute,
  protectAdminRoute,
  cancelAccountSuspension
);
router.post(
  "/:userId/reports/:reportId/acknowledge",
  protectRoute,
  protectAdminRoute,
  acknowledgeReport
);

// user
router.get("/name/:name", protectRoute, getUsersByName);

router.post("/:userId/add-friend", protectRoute, addFriend);
router.post("/:userId/report", protectRoute, reportUser);

router.put("/update-profile", protectRoute, updateProfile);
router.put(
  "/update-profile-admin",
  protectRoute,
  protectAdminRoute,
  updateProfileAdmin
);
router.put("/update-token", protectRoute, updateFcmToken);

router.delete("/deactivate-account", protectRoute, deactivateAccount);

export default router;
