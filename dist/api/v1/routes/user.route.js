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
exports.userRoute = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const userController = __importStar(require("../controllers/user.controller"));
const authMiddleware = __importStar(require("../../../middlewares/auth.middleware"));
const uploadMiddleware = __importStar(require("../../../middlewares/uploadCloud.middleware"));
const userValidation = __importStar(require("../../../validates/user.validate"));
const router = (0, express_1.Router)();
router.get("/", authMiddleware.verifyToken, userController.getUsers);
router.get("/search", authMiddleware.verifyToken, userController.searchUsers);
router.get("/my-info", authMiddleware.verifyToken, userController.getMyInfo);
router.get("/library", authMiddleware.verifyToken, userController.getLibrary);
router.post("/sent-confirm-account", userController.sentConfirmAccount);
router.post("/confirm-account", userController.confirmAccount);
router.get("/:userId/detail", authMiddleware.verifyToken, userController.getUser);
router.put("/:userId", authMiddleware.verifyToken, upload.single("avatarUrl"), uploadMiddleware.upload, userController.updateUser);
router.delete("/:userId", authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.deleteUser);
router.put("/change-password", authMiddleware.verifyToken, userController.changePassword);
router.post("/open-account/:userId", authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.openAccount);
router.post("/register", userValidation.register, userController.register);
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-forgot-password", userController.verifyForgotPassword);
router.post("/create", authMiddleware.verifyToken, authMiddleware.verifyAdmin, userValidation.createUser, userController.createUser);
exports.userRoute = router;
