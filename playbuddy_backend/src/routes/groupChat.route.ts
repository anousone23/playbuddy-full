import { Router } from "express";

import {
  acknowledgeGroupChatReport,
  deleteGroupChatAdmin,
  getAllGroupChatReports,
  getAllGroupChats,
  getGroupChatByIdAdmin,
  getReportedGroupChats,
  updateGroupChatAdmin,
} from "../controllers/admin.controller/groupChat.admin.controller";
import {
  createGroupChat,
  deleteGroupChat,
  getAllGroupChatInLocation,
  getGroupChatById,
  getUserGroupChats,
  inviteToGroupChat,
  joinGroupChat,
  kickFromGroupChat,
  leaveGroupChat,
  reportGroupChat,
  setAsAdmin,
  updateGroupChat,
} from "../controllers/groupChat.controller";
import {
  getAllUserGroupMessages,
  sendGroupMessage,
} from "../controllers/groupMessage.controller";
import {
  protectAdminRoute,
  protectRoute,
} from "../middlewares/auth.middleware";

const router = Router({ mergeParams: true });

// --------- PUBLIC OR USER ROUTES (STATIC FIRST) ---------
router.get("/", protectRoute, getAllGroupChatInLocation);
router.get("/user/:userId", protectRoute, getUserGroupChats);

// --------- ADMIN ROUTES (STATIC BEFORE PARAMETERIZED) ---------
router.get("/admin", protectRoute, protectAdminRoute, getAllGroupChats);
router.get(
  "/admin/:groupChatId",
  protectRoute,
  protectAdminRoute,
  getGroupChatByIdAdmin
);
router.put(
  "/admin/:groupChatId",
  protectRoute,
  protectAdminRoute,
  updateGroupChatAdmin
);

// --------- REPORTS ---------
router.get("/reports", protectRoute, protectAdminRoute, getReportedGroupChats);
router.get(
  "/:groupChatId/reports",
  protectRoute,
  protectAdminRoute,
  getAllGroupChatReports
);
router.post(
  "/:groupChatId/reports/:reportId/acknowledge",
  protectRoute,
  protectAdminRoute,
  acknowledgeGroupChatReport
);

// --------- GROUP CHAT MESSAGES ---------
router.get("/:groupChatId/messages", protectRoute, getAllUserGroupMessages);
router.post("/:groupChatId/send-message", protectRoute, sendGroupMessage);

// --------- USER GROUP CHAT ACTIONS ---------
router.post("/", protectRoute, createGroupChat);
router.post("/:groupChatId/join", protectRoute, joinGroupChat);
router.post("/:groupChatId/leave", protectRoute, leaveGroupChat);
router.post("/:groupChatId/invite", protectRoute, inviteToGroupChat);
router.post("/:groupChatId/report", protectRoute, reportGroupChat);
router.post(
  "/:groupChatId/members/:memberId/kick",
  protectRoute,
  kickFromGroupChat
);
router.post(
  "/:groupChatId/members/:memberId/set-as-admin",
  protectRoute,
  setAsAdmin
);

// --------- GROUP CHAT MANAGEMENT ---------
router.get("/:groupChatId", protectRoute, getGroupChatById);
router.put("/:groupChatId", protectRoute, updateGroupChat);
router.delete(
  "/admin/:groupChatId",
  protectRoute,
  protectAdminRoute,
  deleteGroupChatAdmin
);
router.delete("/:groupChatId", protectRoute, deleteGroupChat);

export default router;
