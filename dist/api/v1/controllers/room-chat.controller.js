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
exports.changeRoleRoom = exports.changeSuperAdmin = exports.leaveRoomChat = exports.removeUserInRoomChat = exports.addUserInRoomChat = exports.updateRoomChat = exports.getRoomChatByRoomId = exports.listRoomChat = exports.createRoomChat = void 0;
const room_chat_model_1 = __importDefault(require("../models/room-chat.model"));
const createRoomChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, usersId } = req.body;
        const currentUserId = req.user.id;
        if (typeof usersId !== "object" || usersId.length < 2) {
            return res.status(400).json({ code: 400, message: "Select two members in the group" });
        }
        const dataRoomChat = {
            title: title,
            typeRoom: "group",
            users: [{ user_id: currentUserId, role_room: "superAdmin" }],
        };
        usersId.forEach((userId) => {
            dataRoomChat.users.push({ user_id: userId, role_room: "user" });
        });
        const room = new room_chat_model_1.default(dataRoomChat);
        yield room.save();
        res.status(200).json({ code: 200, message: "Create room chat successfully", result: room });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.createRoomChat = createRoomChat;
const listRoomChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const rooms = yield room_chat_model_1.default.find({ "users.user_id": currentUserId, deleted: false })
            .populate({
            path: "users.user_id",
            select: "username fullName email gender avatarUrl role dob",
        })
            .populate({
            path: "lastMessage",
            populate: {
                path: "user_id",
                select: "fullName",
            },
            select: "content user_id createdAt",
        })
            .sort({ updatedAt: -1 })
            .select("-__v")
            .lean();
        const result = rooms.map((room) => {
            const users = room.users.map((u) => {
                const infoUser = u.user_id;
                infoUser.role_room = u.role_room;
                return infoUser;
            });
            let title = room.title;
            let avatar = room.avatar;
            if (room.typeRoom === "friend") {
                const targetUser = users.find((u) => u._id.toString() !== currentUserId);
                if (targetUser) {
                    title = targetUser.fullName;
                    avatar = targetUser.avatarUrl;
                }
            }
            return Object.assign(Object.assign({}, room), { users,
                title,
                avatar });
        });
        res.status(200).json({ code: 200, message: "Get list friend successfully", result });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.listRoomChat = listRoomChat;
const getRoomChatByRoomId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId } = req.params;
        const currentUserId = req.user.id;
        const room = yield room_chat_model_1.default.findOne({ _id: roomId, deleted: false })
            .populate({
            path: "users.user_id",
            select: "username fullName email gender avatarUrl role dob",
        })
            .populate({
            path: "lastMessage",
            populate: {
                path: "user_id",
                select: "fullName",
            },
            select: "content user_id createdAt",
        })
            .select("-__v")
            .lean();
        if (!room) {
            return res.status(404).json({ code: 404, message: "Room not found" });
        }
        if (req.user.role !== "ADMIN") {
            const isUserInRoom = room.users.some((u) => u.user_id && u.user_id._id.toString() === currentUserId);
            if (!isUserInRoom) {
                return res.status(403).json({ code: 403, message: "You are not a member of this room" });
            }
        }
        const users = room.users.map((u) => {
            const infoUser = u.user_id;
            infoUser.role_room = u.role_room;
            return infoUser;
        });
        if (room.typeRoom === "friend") {
            const targetUser = users.find((u) => u._id.toString() !== currentUserId);
            room.title = targetUser.fullName;
        }
        const result = Object.assign(Object.assign({}, room), { users });
        res.status(200).json({ code: 200, message: "Get room chat by roomId successfully", result: result });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.getRoomChatByRoomId = getRoomChatByRoomId;
const updateRoomChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const { roomId } = req.params;
        const room = yield room_chat_model_1.default.findOne({ _id: roomId, deleted: false });
        if (!room) {
            return res.status(404).json({ code: 404, message: "Room not found" });
        }
        const isUserInRoom = room.users.some((u) => u.user_id._id.toString() === currentUserId);
        if (!isUserInRoom) {
            return res.status(403).json({ code: 403, message: "You are not a member of this room" });
        }
        yield room_chat_model_1.default.updateOne({ _id: roomId }, { $set: req.body }, { runValidators: true });
        res.status(200).json({ code: 200, message: "Update room chat successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.updateRoomChat = updateRoomChat;
const addUserInRoomChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const { roomId } = req.params;
        const { usersId } = req.body;
        if (!Array.isArray(usersId) || usersId.length === 0) {
            return res.status(400).json({ code: 400, message: "userIds must be a non-empty array" });
        }
        const room = yield room_chat_model_1.default.findOne({ _id: roomId, deleted: false });
        if (!room) {
            return res.status(404).json({ code: 404, message: "Room not found" });
        }
        const isMyUserInRoom = room.users.some((u) => u.user_id._id.toString() === currentUserId);
        if (!isMyUserInRoom) {
            return res.status(403).json({ code: 403, message: "You are not a member of this room" });
        }
        const existingUsersId = room.users.map((u) => u.user_id.toString());
        const newUsersId = usersId.filter((id) => !existingUsersId.includes(id));
        if (newUsersId.length === 0) {
            return res.status(400).json({ code: 400, message: "All users already in the room" });
        }
        const newUsers = newUsersId.map((id) => ({ user_id: id, role_room: "user" }));
        yield room_chat_model_1.default.updateOne({ _id: roomId }, { $push: { users: { $each: newUsers } } }, { runValidators: true });
        res.status(200).json({ code: 200, message: "Add user in room chat successfully", result: newUsersId });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.addUserInRoomChat = addUserInRoomChat;
const removeUserInRoomChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const { roomId, userId } = req.params;
        const room = yield room_chat_model_1.default.findOne({ _id: roomId, deleted: false });
        if (!room) {
            return res.status(404).json({ code: 404, message: "Room not found" });
        }
        const currentUserInRoom = room.users.find((u) => u.user_id.toString() === currentUserId);
        if (!currentUserInRoom) {
            return res.status(403).json({ code: 403, message: "You are not a member of this room" });
        }
        if (currentUserInRoom.role_room !== "superAdmin" && currentUserInRoom.role_room !== "admin") {
            return res.status(403).json({ code: 403, message: "Only superAdmin and admin can remove users" });
        }
        if (currentUserId === userId) {
            return res.status(400).json({ code: 400, message: "You cannot remove yourself" });
        }
        const targetUser = room.users.find((u) => u.user_id.toString() === userId);
        if (!targetUser) {
            return res.status(404).json({ code: 404, message: "User to remove is not in the room" });
        }
        yield room_chat_model_1.default.updateOne({ _id: roomId }, { $pull: { users: { user_id: userId } } }, { runValidators: true });
        res.status(200).json({ code: 200, message: "User removed from room successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.removeUserInRoomChat = removeUserInRoomChat;
const leaveRoomChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const { roomId } = req.params;
        const room = yield room_chat_model_1.default.findOne({ _id: roomId, deleted: false });
        if (!room) {
            return res.status(404).json({ code: 404, message: "Room not found" });
        }
        const userInRoom = room.users.find((u) => u.user_id.toString() === currentUserId);
        if (!userInRoom) {
            return res.status(403).json({ code: 403, message: "You are not a member of this room" });
        }
        if (userInRoom.role_room === "superAdmin") {
            const otherSuperAdmins = room.users.filter((u) => u.user_id.toString() !== currentUserId && u.role_room === "superAdmin");
            if (otherSuperAdmins.length === 0) {
                return res.status(400).json({
                    code: 400,
                    message: "You are the only superAdmin. Please assign another superAdmin before leaving.",
                });
            }
        }
        yield room_chat_model_1.default.updateOne({ _id: roomId }, { $pull: { users: { user_id: currentUserId } } }, { runValidators: true });
        res.status(200).json({ code: 200, message: "You have left the room successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.leaveRoomChat = leaveRoomChat;
const changeSuperAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const { roomId, userId } = req.params;
        const room = yield room_chat_model_1.default.findOne({ _id: roomId, deleted: false });
        if (!room) {
            return res.status(404).json({ code: 404, message: "Room not found" });
        }
        const currentUser = room.users.find((u) => u.user_id.toString() === currentUserId);
        if (!currentUser || currentUser.role_room !== "superAdmin") {
            return res.status(403).json({ code: 403, message: "Only superAdmin can transfer ownership" });
        }
        const targetUser = room.users.find((u) => u.user_id.toString() === userId);
        if (!targetUser) {
            return res.status(404).json({ code: 404, message: "Target user is not in the room" });
        }
        (currentUser.role_room = "admin"), (targetUser.role_room = "superAdmin");
        yield room.save();
        res.status(200).json({ code: 200, message: "Transferred superAdmin successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.changeSuperAdmin = changeSuperAdmin;
const changeRoleRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const { roomId } = req.params;
        const { target_user_id, new_role } = req.body;
        const validRoles = ["user", "admin"];
        if (!validRoles.includes(new_role)) {
            return res.status(400).json({ code: 400, message: "Invalid role" });
        }
        const room = yield room_chat_model_1.default.findById(roomId);
        if (!room || room.deleted) {
            return res.status(404).json({ code: 404, message: "Room not found" });
        }
        const currentUser = room.users.find((u) => u.user_id.toString() === currentUserId);
        if (!currentUser || currentUser.role_room !== "superAdmin") {
            return res.status(403).json({ code: 403, message: "Only superAdmin can change roles" });
        }
        const targetUser = room.users.find((u) => u.user_id.toString() === target_user_id);
        if (!targetUser) {
            return res.status(404).json({ code: 404, message: "User not found in room" });
        }
        if (target_user_id === currentUserId) {
            return res.status(400).json({ code: 400, message: "Cannot change your own role" });
        }
        targetUser.role_room = new_role;
        yield room.save();
        res.status(200).json({ code: 200, message: "Role updated successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.changeRoleRoom = changeRoleRoom;
