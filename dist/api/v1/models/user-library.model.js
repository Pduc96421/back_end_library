"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userLibrarySchema = new mongoose_1.Schema({
    name: String,
    description: String,
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("UserLibrary", userLibrarySchema, "user_libraries");
