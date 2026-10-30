import { Router } from "express";
import * as userController from "../controller/user.controller.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = Router();

// Public
router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);
router.post("/auth/forgot-password", userController.forgotPassword);
router.post("/auth/reset-password", userController.resetPassword);

// Logged-in user (My Account page)
router.post("/users/me", verifyToken, userController.getMe);
router.post("/users/me/update", verifyToken, userController.updateMe);
router.post("/users/me/password", verifyToken, userController.changePassword);

// Admin only
router.post("/users", verifyToken, authorize("admin"), userController.list);

router.post(
  "/users/overview",
  verifyToken,
  authorize("admin"),
  userController.overview,
);

router.post(
  "/users/delete/:id",
  verifyToken,
  authorize("admin"),
  userController.remove,
);
router.post(
  "/users/:id",
  verifyToken,
  authorize("admin"),
  userController.getById,
);

export default router;
