"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCommentToResponse = mapCommentToResponse;
const document_comment_model_1 = __importDefault(require("../api/v1/models/document-comment.model"));
function mapCommentToResponse(comment) {
    return __awaiter(this, void 0, void 0, function* () {
        const replies = yield document_comment_model_1.default.find({ parent_id: comment._id })
            .populate("user_id", "username")
            .sort({ createdAt: 1 });
        const repliesFormatted = yield Promise.all(replies.map(mapCommentToResponse));
        return {
            id: comment._id,
            content: comment.content,
            userId: comment.user_id._id,
            username: comment.user_id.username,
            parentId: comment.parent_id,
            replies: repliesFormatted,
            likesCount: comment.likes_count,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        };
    });
}
