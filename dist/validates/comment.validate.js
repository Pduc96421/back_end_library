"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = void 0;
const addComment = (req, res, next) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ code: 400, message: "Thiếu nội dung bình luận" });
    }
    next();
};
exports.addComment = addComment;
