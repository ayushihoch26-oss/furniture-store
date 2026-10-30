import { Router } from "express";
import * as categoryController from "../controller/category.controller.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = Router();

// Public - active categories for dropdowns
router.post("/category/options", categoryController.options);

// Admin only (Categories page)
router.post(
  "/admin/category/list",
  verifyToken,
  authorize("admin"),
  categoryController.adminList,
);
router.post(
  "/admin/category/stats",
  verifyToken,
  authorize("admin"),
  categoryController.stats,
);
router.post(
  "/admin/category/create",
  verifyToken,
  authorize("admin"),
  categoryController.create,
);
router.post(
  "/admin/category/update/:id",
  verifyToken,
  authorize("admin"),
  categoryController.update,
);
router.post(
  "/admin/category/delete/:id",
  verifyToken,
  authorize("admin"),
  categoryController.remove,
);
router.post(
  "/admin/category/:id",
  verifyToken,
  authorize("admin"),
  categoryController.getById,
);

export default router;
