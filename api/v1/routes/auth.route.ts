import { Router } from "express";
import AuthController, * as authController from "../controllers/auth.controller";
import * as authMiddleware from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/login", authController.login);
router.post("/logout", authMiddleware.verifyToken, authController.logout);
router.post("/refresh", authController.refreshToken);
router.post(
  "/validate-token",
  authMiddleware.verifyToken,
  authController.validateToken,
);
router.post("/google-login", AuthController.googleLogin);

export const authRoute = router;
