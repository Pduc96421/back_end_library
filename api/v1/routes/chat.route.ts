import { Router } from "express";
import multer from "multer";

const router: Router = Router();
const upload = multer();

import * as uploadCloud from "../../../middlewares/uploadCloud.middleware";
import * as controllerChat from "../controllers/chat.controller";
import * as validateChat from "../../../validates/chat.validate";

router.post("/send", validateChat.sendMessage, controllerChat.sendMessage);

router.post(
  "/send-file",
  validateChat.sendFileMessage,
  upload.single("file_url"),
  uploadCloud.upload,
  controllerChat.sendFileMessage,
);

router.patch("/:chatId/react", validateChat.reactMessage, controllerChat.reactMessage);

router.get("/:chatId/reactions", controllerChat.getReactions);

router.patch("/update/:chatId", validateChat.updateMessage, controllerChat.updateMessage);

router.get("/:roomId", controllerChat.getMessages);

router.delete("/:chatId", controllerChat.deleteMessage);

router.delete("delete-multiple", controllerChat.deleteMultipleMessages);

export const chatRoute: Router = router;
