"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleMessages = exports.deleteMessage = exports.getReactions = exports.reactMessage = exports.updateMessage = exports.getMessages = exports.sendFileMessage = exports.sendMessage = void 0;
const chat_model_1 = __importDefault(require("../models/chat.model"));
const room_chat_model_1 = __importDefault(require("../models/room-chat.model"));
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { room_chat_id, content, reply_chat_id } = req.body;
        const currentUserId = req.user.id;
        const room = yield room_chat_model_1.default.findOne({ _id: room_chat_id, deleted: false });
        if (!room) {
            return res.status(404).json({ code: 404, message: "Room not found" });
        }
        const isMember = room.users.some((u) => u.user_id.toString() === currentUserId);
        if (!isMember) {
            return res.status(403).json({ code: 403, message: "You are not a member of this room" });
        }
        if (reply_chat_id) {
            const originalMessage = yield chat_model_1.default.findOne({ _id: reply_chat_id, room_chat_id, deleted: false });
            if (!originalMessage) {
                return res.status(400).json({ code: 400, message: "Reply target not found or invalid" });
            }
        }
        const chat = new chat_model_1.default({ user_id: currentUserId, room_chat_id, content, reply_chat_id: reply_chat_id || null });
        yield chat.save();
        yield room_chat_model_1.default.findByIdAndUpdate(room_chat_id, { lastMessage: chat._id });
        res.status(200).json({ code: 200, message: "Message sent", result: chat });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.sendMessage = sendMessage;
const sendFileMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const room_chat_id = req.body.room_chat_id;
        const reply_chat_id = req.body.reply_chat_id;
        const currentUserId = req.user.id;
        if (!req.body.file_url) {
            return res.status(400).json({ code: 400, message: "No file uploaded or invalid format" });
        }
        const room = yield room_chat_model_1.default.findOne({ _id: room_chat_id, deleted: false });
        if (!room) {
            return res.status(404).json({ code: 404, message: "Room not found" });
        }
        const isMember = room.users.some((u) => u.user_id.toString() === currentUserId);
        if (!isMember) {
            return res.status(403).json({ code: 403, message: "You are not a member of this room" });
        }
        const newMessage = new chat_model_1.default({
            user_id: currentUserId,
            room_chat_id,
            type: "file",
            file_url: req.body.file_url,
            file_name: ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname) || "",
            reply_chat_id: reply_chat_id || null,
        });
        yield newMessage.save();
        yield room_chat_model_1.default.findByIdAndUpdate(room_chat_id, { lastMessage: newMessage._id });
        res.status(200).json({ code: 200, message: "File sent successfully", result: newMessage });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.sendFileMessage = sendFileMessage;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId } = req.params;
        const currentUserId = req.user.id;
        const room = yield room_chat_model_1.default.findOne({ _id: roomId, deleted: false });
        if (!room) {
            return res.status(404).json({ code: 404, message: "Room not found" });
        }
        if (req.user.role !== "ADMIN") {
            const isMember = room.users.some((u) => u.user_id.toString() === currentUserId);
            if (!isMember) {
                return res.status(403).json({ code: 403, message: "You are not a member of this room" });
            }
        }
        const messages = yield chat_model_1.default.find({ room_chat_id: roomId, deleted: false })
            .populate("user_id", "username fullName avatarUrl")
            .populate({
            path: "reply_chat_id",
            populate: {
                path: "user_id",
                select: "username fullName avatarUrl",
            },
            select: "content user_id createdAt",
        })
            .select("-__v")
            .sort({ createdAt: 1 });
        res.status(200).json({ code: 200, message: "Messages retrieved", result: messages });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.getMessages = getMessages;
const updateMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const currentUserId = req.user.id;
        const chat = yield chat_model_1.default.findById(chatId);
        if (!chat || chat.deleted) {
            return res.status(404).json({ code: 404, message: "Chat not found" });
        }
        if (req.user.role !== "ADMIN") {
            if (chat.user_id.toString() !== currentUserId) {
                return res.status(403).json({ code: 403, message: "You can only update your own messages" });
            }
        }
        chat.content = content;
        yield chat.save();
        res.status(200).json({ code: 200, message: "Message updated successfully", result: chat });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.updateMessage = updateMessage;
const reactMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const { icon } = req.body;
        const currentUserId = req.user.id;
        const chat = yield chat_model_1.default.findById(chatId);
        if (!chat || chat.deleted) {
            return res.status(404).json({ code: 404, message: "Message not found" });
        }
        const existingReactIndex = chat.reactions.findIndex((r) => r.user_id.toString() === currentUserId);
        if (existingReactIndex !== -1) {
            if (chat.reactions[existingReactIndex].icon === icon) {
                chat.reactions.splice(existingReactIndex, 1);
            }
            else {
                chat.reactions[existingReactIndex].icon = icon;
            }
        }
        else {
            chat.reactions.push({ user_id: currentUserId, icon });
        }
        yield chat.save();
        res.status(200).json({ code: 200, message: "React success", result: chat.reactions });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.reactMessage = reactMessage;
const getReactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const chat = yield chat_model_1.default.findById(chatId)
            .populate({
            path: "reactions.user_id",
            select: "username fullName avatarUrl",
        })
            .lean();
        if (!chat) {
            return res.status(404).json({ code: 404, message: "Message not found" });
        }
        const reactionCounts = {};
        const reactionUsers = {};
        for (const reaction of chat.reactions) {
            const icon = reaction.icon;
            const user = reaction.user_id;
            if (!reactionCounts[icon]) {
                reactionCounts[icon] = 0;
                reactionUsers[icon] = [];
            }
            reactionCounts[icon]++;
            reactionUsers[icon].push(user);
        }
        res.status(200).json({
            code: 200,
            message: "Reaction stats fetched successfully",
            result: {
                counts: reactionCounts,
                users: reactionUsers,
            },
        });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.getReactions = getReactions;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const currentUserId = req.user.id;
        const chat = yield chat_model_1.default.findById(chatId);
        if (!chat || chat.deleted) {
            return res.status(404).json({ code: 404, message: "Chat not found or already deleted" });
        }
        if (chat.user_id.toString() !== currentUserId) {
            return res.status(403).json({ code: 403, message: "You can only delete your own messages" });
        }
        chat.deleted = true;
        chat.deletedAt = new Date();
        yield chat.save();
        res.status(200).json({ code: 200, message: "Message deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.deleteMessage = deleteMessage;
const deleteMultipleMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatIds } = req.body;
        const userId = req.user.id;
        if (!Array.isArray(chatIds) || chatIds.length === 0) {
            return res.status(400).json({ code: 400, message: "chatIds must be a non-empty array" });
        }
        const chats = yield chat_model_1.default.find({ _id: { $in: chatIds }, deleted: false });
        if (req.user.role !== "ADMIN") {
            const unauthorized = chats.filter((chat) => chat.user_id.toString() !== userId);
            if (unauthorized.length > 0 && req.user.role !== "ADMIN") {
                return res.status(403).json({ code: 403, message: "You can only delete your own messages" });
            }
        }
        yield chat_model_1.default.updateMany({ _id: { $in: chatIds } }, { $set: { deleted: true, deletedAt: new Date() } });
        res.status(200).json({ code: 200, message: "Messages deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.deleteMultipleMessages = deleteMultipleMessages;
