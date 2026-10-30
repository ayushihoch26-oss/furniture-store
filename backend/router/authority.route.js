// backend: src/routes/authority.route.js
//
// Mount in app.js / server.js:
//   import authorityRoutes from "./routes/authority.route.js";
//   app.use("/api/authority", authorityRoutes);

import { Router } from "express";
import * as authorityController from "../controller/authority.controller.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = Router();

// Everything here is admin only
router.use(verifyToken, authorize("admin"));

// Members
router.post("/list", authorityController.list);
router.post("/create", authorityController.create);
router.post("/update/:id", authorityController.update);
router.post("/delete/:id", authorityController.remove);
router.post("/delete-many", authorityController.removeMany);

// Role permissions
router.post("/permissions", authorityController.getPermissions);
router.post("/permissions/save", authorityController.savePermissions);

export default router;
