"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const documentDownloadSchema = new mongoose_1.Schema({
    document_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Document" },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    download_count: { type: Number, default: 0 },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("DocumentDownload", documentDownloadSchema, "document_downloads");
