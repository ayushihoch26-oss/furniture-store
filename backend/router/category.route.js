import { Router } from "express";
import * as categoryController from "../controller/category.controller.js";
import { verifyToken, authorize } from "../middleware/auth.js";
import {
  validateCategoryCreate,
  validateCategoryId,
  validateCategoryList,
  validateCategoryUpdate,
} from "../validator/category.validator.js";

const router = Router();

// Public - active categories for dropdowns
router.post("/category/options", categoryController.options);

// Admin only (Categories page)
router.post(
  "/admin/category/list",
  verifyToken,
  authorize("admin"),
  validateCategoryList,
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
  validateCategoryCreate,
  categoryController.create,
);
router.post(
  "/admin/category/update/:id",
  verifyToken,
  authorize("admin"),
  validateCategoryId,
  validateCategoryUpdate,
  categoryController.update,
);
router.post(
  "/admin/category/delete/:id",
  verifyToken,
  authorize("admin"),
  validateCategoryId,
  categoryController.remove,
);
router.post(
  "/admin/category/:id",
  verifyToken,
  authorize("admin"),
  validateCategoryId,
  categoryController.getById,
);

export default router;
