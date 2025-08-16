"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const documentTagSchema = new mongoose_1.Schema({
    document_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Document" },
    tag_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Tag" },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("DocumentTag", documentTagSchema, "document_tags");
