import { Router } from "express";
import * as authMiddleware from "../../../middlewares/auth.middleware";
import * as controllerLibrary from "../controllers/library.controller";

const router = Router();

router.get("/", authMiddleware.verifyToken, controllerLibrary.getAllLibraryOfUser);

router.get("/user/:libraryId", authMiddleware.verifyToken, controllerLibrary.getOneLibraryOfUser);

router.get("/all-library/:userId", authMiddleware.verifyToken, controllerLibrary.getAllLibraryOfUserId);

router.post("/", authMiddleware.verifyToken, controllerLibrary.createLibrary);

router.put("/:libraryId", authMiddleware.verifyToken, controllerLibrary.updateLibrary);

router.delete("/:libraryId", authMiddleware.verifyToken, controllerLibrary.deleteLibrary);

router.post("/:libraryId/:documentId/status", authMiddleware.verifyToken, controllerLibrary.changeStatusDocument);

router.post("/user/:libraryId/:documentId", authMiddleware.verifyToken, controllerLibrary.addDocumentToLibrary);

router.delete("/user/:libraryId/:documentId", authMiddleware.verifyToken, controllerLibrary.deleteDocumentToLibrary);

export const libraryRoute: Router = router;
