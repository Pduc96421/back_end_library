"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const libraryDocumentSchema = new mongoose_1.Schema({
    document_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Document" },
    library_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "UserLibrary" },
    status: { type: String, enum: ["UNREAD", "COMPLETED"], default: "UNREAD" },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    note: String,
    category: String,
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("LibraryDocument", libraryDocumentSchema, "library_documents");
