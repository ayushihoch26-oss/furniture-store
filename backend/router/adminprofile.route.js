import { Router } from "express";
import * as adminProfileController from "../controller/adminprofile.controller.js";
import { verifyToken, authorize } from "../middleware/auth.js";
import productUpload from "../middleware/productUpload.js"; // multer (memory storage)

const router = Router();

// Every route is for the logged-in admin only
router.use(verifyToken, authorize("admin"));

router.post("/me", adminProfileController.getProfile);
router.post("/update", adminProfileController.updateProfile);
router.post(
  "/upload-image",
  productUpload.single("image"),
  adminProfileController.uploadImage,
);
router.post("/delete-image", adminProfileController.deleteImage);
router.post("/social", adminProfileController.setSocial);

// Password change uses the existing users route: POST /api/users/users/me/password

export default router;

// In server.js add:
//   import adminProfileRoutes from "./router/adminProfile.route.js";
//   app.use("/api/admin-profile", adminProfileRoutes);
