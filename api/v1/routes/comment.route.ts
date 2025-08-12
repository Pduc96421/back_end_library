import { Router } from "express";
import * as authMiddleware from "../../../middlewares/auth.middleware";
import * as controllerComment from "../controllers/comment.controller";
import * as validateComment from "../../../validates/comment.validate";

const router = Router();

router.get("/:documentId", controllerComment.getComments);

router.post("/:documentId", authMiddleware.verifyToken, validateComment.addComment, controllerComment.addComment);

router.get("/:documentId/:commentId/replies", controllerComment.getCommentReplies);

router.post("/:documentId/:commentId/like", authMiddleware.verifyToken, controllerComment.likeComment);

router.delete("/:documentId/:commentId/like", authMiddleware.verifyToken, controllerComment.unlikeComment);

router.delete("/:documentId/:commentId", authMiddleware.verifyToken, controllerComment.deleteComment);

export const commentRoute: Router = router;
