import { Express } from "express";
import { documentRoute } from "./document.route";
import { reminderRoute } from "./reminder.route";
import { libraryRoute } from "./library.route";
import { commentRoute } from "./comment.route";
import { categoryRoute } from "./category.route";
import { roleRoute } from "./role.route";
import { authRoute } from "./auth.route";
import { userRoute } from "./user.route";
import { notificationRoute } from "./notification.route";
import { chatRoute } from "./chat.route";
import { roomChatRoute } from "./room-chat.route";
import { usersRoute } from "./users.route";

import * as authMiddleware from "../../../middlewares/auth.middleware";
import { paymentRoute } from "./payment.route";

export const routeApiV1 = (app: Express): void => {
  app.use(authMiddleware.infoUser);

  app.use("/documents", documentRoute);
  app.use("/reminders", reminderRoute);
  app.use("/library", libraryRoute);
  app.use("/comments", commentRoute);
  app.use("/categories", categoryRoute);
  app.use("/roles", roleRoute);
  app.use("/auth", authRoute);
  app.use("/users", userRoute);
  app.use("/notifications", notificationRoute);
  app.use("/payments", paymentRoute);

  app.use("/chats", authMiddleware.verifyToken, chatRoute);
  app.use("/room-chat", authMiddleware.verifyToken, roomChatRoute);
  app.use("/user-fr", authMiddleware.verifyToken, usersRoute);
};
