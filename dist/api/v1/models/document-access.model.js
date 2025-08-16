"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const documentAccessSchema = new mongoose_1.Schema({
    document_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Document" },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    access_type: { type: String, enum: ["VIEW", "DOWNLOAD", "EDIT"] },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("DocumentAccess", documentAccessSchema, "document_access");
