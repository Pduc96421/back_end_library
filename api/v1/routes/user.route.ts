import { Router } from "express";
import multer from "multer";

const upload = multer();
import * as userController from "../controllers/user.controller";
import * as authMiddleware from "../../../middlewares/auth.middleware";
import * as uploadMiddleware from "../../../middlewares/uploadCloud.middleware";
import * as userValidation from "../../../validates/user.validate";

const router = Router();

router.get("/", authMiddleware.verifyToken, userController.getUsers);

router.get("/search", authMiddleware.verifyToken, userController.searchUsers);

router.get("/my-info", authMiddleware.verifyToken, userController.getMyInfo);

router.get("/library", authMiddleware.verifyToken, userController.getLibrary);

router.post("/sent-confirm-account", userController.sentConfirmAccount);

router.post("/confirm-account", userController.confirmAccount);

router.get("/:userId/detail", authMiddleware.verifyToken, userController.getUser);

router.put(
  "/:userId",
  authMiddleware.verifyToken,
  upload.single("avatarUrl"),
  uploadMiddleware.upload,
  userController.updateUser,
);

router.delete("/:userId", authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.deleteUser);

router.put("/change-password", authMiddleware.verifyToken, userController.changePassword);

router.post(
  "/open-account/:userId",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  userController.openAccount,
);

router.post("/register", userValidation.register, userController.register);

router.post("/forgot-password", userController.forgotPassword);

router.post(
  "/create",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  userValidation.createUser,
  userController.createUser,
);

export const usersRoute = router;
