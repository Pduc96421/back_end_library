import { Router } from "express";

import * as authMiddleware from "../../../middlewares/auth.middleware";
import * as controllerReminder from "../controllers/reminder.controller";

const router = Router();

router.get("/", authMiddleware.verifyToken, controllerReminder.getAllReminders);

router.get("/:reminderId", authMiddleware.verifyToken, controllerReminder.getReminderById);

router.post("/:documentId", authMiddleware.verifyToken, controllerReminder.createReminder);

router.put("/:reminderId", authMiddleware.verifyToken, controllerReminder.updateReminder);

router.delete("/:reminderId", authMiddleware.verifyToken, controllerReminder.deleteReminder);

router.put("/:reminderId/toggle", authMiddleware.verifyToken, controllerReminder.toggleReminder);

export const reminderRoute: Router = router;