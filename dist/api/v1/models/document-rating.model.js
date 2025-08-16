"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const documentRatingSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    document_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Document" },
    rating: Number,
    review: String,
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("DocumentRating", documentRatingSchema, "document_ratings");
