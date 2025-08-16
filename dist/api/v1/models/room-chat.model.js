"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RoomChatSchema = new mongoose_1.Schema({
    title: String,
    avatar: String,
    theme: String,
    typeRoom: { type: String, enum: ["group", "friend"] },
    status: String,
    lastMessage: { type: mongoose_1.Schema.Types.ObjectId, ref: "Chat" },
    users: [
        {
            user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
            role_room: { type: String, enum: ["superAdmin", "user", "admin"] },
            _id: false,
        },
    ],
    deleted: { type: Boolean, default: false },
    deletedAt: Date,
}, { timestamps: true });
const RoomChat = (0, mongoose_1.model)("RoomChat", RoomChatSchema, "room-chat");
exports.default = RoomChat;
