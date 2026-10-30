import { Router } from "express";
import * as contactUsController from "../controller/contactus.controller.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/", contactUsController.create);

router.post("/list", verifyToken, authorize("admin"), contactUsController.list);

router.post(
  "/stats",
  verifyToken,
  authorize("admin"),
  contactUsController.stats,
);

router.post(
  "/delete/:id",
  verifyToken,
  authorize("admin"),
  contactUsController.remove,
);

router.post(
  "/update/:id",
  verifyToken,
  authorize("admin"),
  contactUsController.updateStatus,
);

router.post(
  "/:id",
  verifyToken,
  authorize("admin"),
  contactUsController.getById,
);

export default router;
