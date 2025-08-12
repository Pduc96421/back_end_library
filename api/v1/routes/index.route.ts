import { Express } from "express";
import { documentRoute } from "./document.route";
import { reminderRoute } from "./reminder.route";
import { libraryRoute } from "./library.route";
import { commentRoute } from "./comment.route";
import { categoryRoute } from "./category.route";
import { roleRoute } from "./role.route";
import { authRoute } from "./auth.route";
import { usersRoute } from "./user.route";
import { notificationRoute } from "./notification.route";

export const routeApiV1 = (app: Express): void => {
  app.use("/documents", documentRoute);
  app.use("/reminders", reminderRoute);
  app.use("/library", libraryRoute);
  app.use("/comments", commentRoute);
  app.use("/categories", categoryRoute);
  app.use("/roles", roleRoute);
  app.use("/auth", authRoute);
  app.use("/users", usersRoute);
  app.use("/notifications", notificationRoute);
};
