"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    full_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phone_number: { type: String },
    avatarUrl: { type: String, default: "https://cdn-icons-png.flaticon.com/512/149/149071.png" },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], default: "OTHER" },
    dob: Date,
    role: { type: String, ref: "Role", enum: ["ADMIN", "USER"], default: "USER" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "LOCKED"], default: "ACTIVE" },
    email_verified: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    token: { type: String, select: false },
    acceptFriends: [{ user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }, _id: false }],
    requestFriends: [{ user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }, _id: false }],
    friendList: [
        {
            user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
            room_chat_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "RoomChat", required: true },
            _id: false,
        },
    ],
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema, "users");
exports.default = exports.User;
