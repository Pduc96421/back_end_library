import { Router } from "express";
import * as authMiddleware from "../../../middlewares/auth.middleware";
import * as controllerNotification from "../controllers/notification.controller";

const router = Router();

router.get("/", authMiddleware.verifyToken, controllerNotification.getNotifications);

export const notificationRoute: Router = router;