"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const documentLikeSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    document_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Document", required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("DocumentLike", documentLikeSchema, "document_likes");
