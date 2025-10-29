import express from "express";

import {
  activateAccount,
  forgetPassword,
  getAuthUser,
  login,
  resetPassword,
  signup,
  verifyOtp,
} from "../controllers/auth.controller";
import { protectRoute } from "../middlewares/auth.middleware";
import { loginAdmin } from "../controllers/admin.controller/auth.admin.controller";

const router = express.Router();

router.get("/happy", (req, res) => {
  res.status(200).json({ message: "Happy" });
});

router.get("/user", protectRoute, getAuthUser);
router.post("/sign-up", signup);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/activate-account", activateAccount);

router.post("/admin/login", loginAdmin);

export default router;
