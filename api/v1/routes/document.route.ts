import { Router } from "express";
import multer from "multer";

import * as authMiddleware from "../../../middlewares/auth.middleware";
import * as controllerDocument from "../controllers/document.controller";
import * as validateDocument from "../../../validates/document.validate";
import { uploadFile } from "../../../middlewares/uploadFile.middleware";

const router = Router();

router.get("/all-document", controllerDocument.getAllDocuments);

router.get("/top-document", controllerDocument.getTopDocuments);

router.get("/search", controllerDocument.searchDocuments);

router.get("/pending", authMiddleware.verifyToken, controllerDocument.getPendingDocuments);

router.get("/user", authMiddleware.verifyToken, controllerDocument.getDocumentOfUser);

router.get("/user/share-document", authMiddleware.verifyToken, controllerDocument.getSharedDocuments);

router.get("/:documentId/detail", authMiddleware.verifyToken, controllerDocument.getDocument);

router.patch("/:documentId", authMiddleware.verifyToken, controllerDocument.updateDocument);

router.delete("/:documentId", authMiddleware.verifyToken, controllerDocument.deleteDocument);

router.put(
  "/:documentId/approve",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  controllerDocument.approveDocument,
);

router.put(
  "/:documentId/reject",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  controllerDocument.rejectDocument,
);

router.post("/:documentId/like", authMiddleware.verifyToken, controllerDocument.likeDocument);

router.delete("/:documentId/like", authMiddleware.verifyToken, controllerDocument.unlikeDocument);

router.post(
  "/:documentId/access",
  authMiddleware.verifyToken,
  validateDocument.changeAccess,
  controllerDocument.changeAccess,
);

router.get("/:documentId/download", authMiddleware.verifyToken, controllerDocument.downloadDocument);

router.post(
  "/:documentId/rate",
  authMiddleware.verifyToken,
  validateDocument.rateDocument,
  controllerDocument.rateDocument,
);

router.post(
  "/upload",
  authMiddleware.verifyToken,
  multer().single("file"),
  uploadFile,
  validateDocument.uploadDocument,
  controllerDocument.uploadDocument,
);

router.get("/all-tag", controllerDocument.getAllTags);

export const documentRoute: Router = router;
