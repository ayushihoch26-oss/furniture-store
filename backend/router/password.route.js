import { Router } from "express";
import * as passwordController from "../controller/password.controller.js";

const router = Router();

// Public routes (the user is logged out when they forget the password)
router.post("/forgot", passwordController.forgot);
router.post("/reset", passwordController.reset);

export default router;
