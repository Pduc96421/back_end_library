"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const documentViewSchema = new mongoose_1.Schema({
    document_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Document" },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("DocumentView", documentViewSchema, "document_views");
