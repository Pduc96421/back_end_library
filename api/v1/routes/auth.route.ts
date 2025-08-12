import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as authMiddleware from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/login", authController.login);
router.post("/logout", authMiddleware.verifyToken, authController.logout);
router.post("/refresh", authController.refreshToken);
router.post("/validate-token", authMiddleware.verifyToken, authController.validateToken);
router.get("/google-login", authController.googleLogin); // Nếu có OAuth2
router.get("/google-login-success", authController.googleLoginSuccess); // Callback OAuth2

export const authRoute = router;
