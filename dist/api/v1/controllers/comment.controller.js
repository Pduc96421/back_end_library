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
exports.deleteComment = exports.unlikeComment = exports.likeComment = exports.getCommentReplies = exports.addComment = exports.getComments = void 0;
const document_comment_model_1 = __importDefault(require("../models/document-comment.model"));
const pagination_1 = require("../../../helpers/pagination");
const format_comment_1 = require("../../../helpers/format-comment");
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId } = req.params;
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const findComments = { document_id: documentId, parent_id: null };
        const comments = yield document_comment_model_1.default.find(findComments)
            .populate("user_id", "username")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(size);
        const totalElements = yield document_comment_model_1.default.countDocuments(findComments);
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(comments.map(format_comment_1.mapCommentToResponse));
        return res.status(200).json({
            code: 200,
            message: "Lấy bình luận thành công",
            result: {
                content,
                page,
                size,
                totalElements,
                totalPages,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getComments = getComments;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { documentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { content, parent_id } = req.body;
        const comment = yield document_comment_model_1.default.create({
            content,
            user_id: userId,
            document_id: documentId,
            parent_id: parent_id || null,
        });
        return res.status(201).json({ code: 201, message: "Thêm bình luận thành công", result: comment });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.addComment = addComment;
const getCommentReplies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, commentId } = req.params;
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const findComments = { document_id: documentId, parent_id: commentId };
        const comments = yield document_comment_model_1.default.find(findComments)
            .populate("user_id", "username")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(size);
        const totalElements = yield document_comment_model_1.default.countDocuments(findComments);
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(comments.map(format_comment_1.mapCommentToResponse));
        return res.status(200).json({
            code: 200,
            message: "Lấy bình luận thành công",
            result: {
                content,
                page,
                size,
                totalElements,
                totalPages,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getCommentReplies = getCommentReplies;
const likeComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, commentId } = req.params;
        const comment = yield document_comment_model_1.default.findOneAndUpdate({ _id: commentId, document_id: documentId }, { $inc: { likes_count: 1 } }, { new: true });
        if (!comment) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy bình luận" });
        }
        return res.status(200).json({ code: 200, message: "Like bình luận thành công", result: comment });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.likeComment = likeComment;
const unlikeComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, commentId } = req.params;
        const comment = yield document_comment_model_1.default.findOneAndUpdate({ _id: commentId, document_id: documentId }, { $inc: { likes_count: -1 } }, { new: true });
        if (!comment) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy bình luận" });
        }
        return res.status(200).json({ code: 200, message: "Bỏ like bình luận thành công", result: comment });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.unlikeComment = unlikeComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { commentId } = req.params;
        const deleted = yield document_comment_model_1.default.findByIdAndDelete(commentId);
        if (!deleted) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy bình luận" });
        }
        return res.status(200).json({ code: 200, message: "Xóa bình luận thành công" });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.deleteComment = deleteComment;
