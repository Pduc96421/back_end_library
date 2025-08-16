"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentRoute = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const authMiddleware = __importStar(require("../../../middlewares/auth.middleware"));
const controllerDocument = __importStar(require("../controllers/document.controller"));
const validateDocument = __importStar(require("../../../validates/document.validate"));
const uploadFile_middleware_1 = require("../../../middlewares/uploadFile.middleware");
const router = (0, express_1.Router)();
router.get("/all-document", controllerDocument.getAllDocuments);
router.get("/top-document", controllerDocument.getTopDocuments);
router.get("/search", controllerDocument.searchDocuments);
router.get("/pending", authMiddleware.verifyToken, controllerDocument.getPendingDocuments);
router.get("/user", authMiddleware.verifyToken, controllerDocument.getDocumentOfUser);
router.get("/user/share-document", authMiddleware.verifyToken, controllerDocument.getSharedDocuments);
router.get("/:documentId/detail", authMiddleware.verifyToken, controllerDocument.getDocument);
router.patch("/:documentId", authMiddleware.verifyToken, controllerDocument.updateDocument);
router.delete("/:documentId", authMiddleware.verifyToken, controllerDocument.deleteDocument);
router.put("/:documentId/approve", authMiddleware.verifyToken, authMiddleware.verifyAdmin, controllerDocument.approveDocument);
router.put("/:documentId/reject", authMiddleware.verifyToken, authMiddleware.verifyAdmin, controllerDocument.rejectDocument);
router.post("/:documentId/like", authMiddleware.verifyToken, controllerDocument.likeDocument);
router.delete("/:documentId/like", authMiddleware.verifyToken, controllerDocument.unlikeDocument);
router.post("/:documentId/access", authMiddleware.verifyToken, validateDocument.changeAccess, controllerDocument.changeAccess);
router.get("/:documentId/download", authMiddleware.verifyToken, controllerDocument.downloadDocument);
router.post("/:documentId/rate", authMiddleware.verifyToken, validateDocument.rateDocument, controllerDocument.rateDocument);
router.post("/upload", authMiddleware.verifyToken, (0, multer_1.default)().single("file"), uploadFile_middleware_1.uploadFile, validateDocument.uploadDocument, controllerDocument.uploadDocument);
router.get("/all-tag", controllerDocument.getAllTags);
exports.documentRoute = router;
