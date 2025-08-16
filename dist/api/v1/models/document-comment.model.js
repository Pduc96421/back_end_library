"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const documentCommentSchema = new mongoose_1.Schema({
    content: String,
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    document_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Document" },
    parent_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "DocumentComment" },
    likes_count: { type: Number, default: 0 },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("DocumentComment", documentCommentSchema, "document_comments");
