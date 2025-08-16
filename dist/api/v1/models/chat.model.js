"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ChatSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    room_chat_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "RoomChat", required: true },
    reply_chat_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Chat", default: null },
    content: String,
    file_url: String,
    file_name: String,
    deleted: { type: Boolean, default: false },
    deletedAt: Date,
    reactions: [
        {
            user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
            icon: { type: String, required: true, enum: ["❤️", "👍", "😂", "😮", "😢", "😡"] },
            _id: false,
        },
    ],
}, { timestamps: true });
const Chat = (0, mongoose_1.model)("Chat", ChatSchema, "chat");
exports.default = Chat;
