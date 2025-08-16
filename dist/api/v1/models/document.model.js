"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const documentSchema = new mongoose_1.Schema({
    title: String,
    description: String,
    downloadable: Boolean,
    preview_urls: [String],
    file_type: String,
    file_url: String,
    file_size: Number,
    is_public: Boolean,
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"] },
    created_by: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    modified_by: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    category_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category" },
}, { timestamps: true });
const Document = (0, mongoose_1.model)("Document", documentSchema, "documents");
exports.default = Document;
