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
exports.deleteFriend = exports.acceptFriend = exports.refuseFriend = exports.cancelFriend = exports.addFriend = exports.getFriends = exports.getAccept = exports.getRequest = exports.getNotFriend = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const room_chat_model_1 = __importDefault(require("../models/room-chat.model"));
const getNotFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const myUser = yield user_model_1.default.findOne({ _id: currentUserId, deleted: false });
        const requestFriends = myUser.requestFriends.map((item) => item.user_id);
        const acceptFriends = myUser.acceptFriends.map((item) => item.user_id);
        const friendList = myUser.friendList.map((item) => item.user_id);
        const users = yield user_model_1.default.find({
            $and: [
                { _id: { $nin: requestFriends } },
                { _id: { $ne: currentUserId } },
                { _id: { $nin: acceptFriends } },
                { _id: { $nin: friendList } },
            ],
            status: "active",
            deleted: false,
        }).select("username fullName email gender avatarUrl role dob");
        res.status(201).json({ code: 201, message: "Get info not friend successfully", result: users });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.getNotFriend = getNotFriend;
const getRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const myUser = yield user_model_1.default.findOne({ _id: currentUserId, deleted: false }).populate({
            path: "requestFriends.user_id",
            select: "username fullName email gender avatarUrl role dob",
        });
        if (!myUser) {
            return res.status(404).json({ code: 403, message: `User of ${currentUserId} not found` });
        }
        const users = myUser.requestFriends.map((item) => item.user_id);
        res.status(201).json({ code: 201, message: "Get request successfully", result: users });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.getRequest = getRequest;
const getAccept = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const myUser = yield user_model_1.default.findOne({ _id: currentUserId, deleted: false }).populate({
            path: "acceptFriends.user_id",
            select: "username fullName email gender avatarUrl role dob",
        });
        if (!myUser) {
            return res.status(404).json({ code: 403, message: `User of ${currentUserId} not found` });
        }
        const users = myUser.acceptFriends.map((item) => item.user_id);
        res.status(201).json({ code: 201, message: "Get accept successfully", result: users });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.getAccept = getAccept;
const getFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const myUser = yield user_model_1.default.findOne({ _id: currentUserId, deleted: false })
            .populate({
            path: "friendList.user_id",
            select: "username fullName email gender avatarUrl role dob",
        })
            .lean();
        if (!myUser) {
            return res.status(404).json({ code: 403, message: `User of ${currentUserId} not found` });
        }
        const users = myUser.friendList.map((item) => {
            const user = item.user_id;
            user.room_chat_id = item.room_chat_id.toString();
            return user;
        });
        res.status(201).json({ code: 201, message: "Get friends successfully", result: users });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.getFriends = getFriends;
const addFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;
        const currentUser = yield user_model_1.default.findById(currentUserId);
        const targetUser = yield user_model_1.default.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ code: 404, message: "User to add not found" });
        }
        const isFriend = currentUser.friendList.some((friend) => friend.user_id.toString() === userId);
        if (isFriend) {
            return res.status(400).json({ code: 400, message: "Already friends" });
        }
        const alreadyRequested = currentUser.requestFriends.some((acc) => acc.user_id.toString() === userId);
        if (alreadyRequested) {
            return res.status(400).json({ code: 400, message: "Friend request already sent" });
        }
        const hasReceivedRequest = currentUser.acceptFriends.some((acc) => acc.user_id.toString() === userId);
        if (hasReceivedRequest) {
            return res.status(400).json({ code: 400, message: "User has already sent you a friend request" });
        }
        yield user_model_1.default.updateOne({ _id: currentUserId }, { $push: { requestFriends: { user_id: userId } } }, { runValidators: true });
        yield user_model_1.default.updateOne({ _id: userId }, { $push: { acceptFriends: { user_id: currentUserId } } }, { runValidators: true });
        res.status(201).json({ code: 201, message: "Add friend successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.addFriend = addFriend;
const cancelFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;
        const currentUser = yield user_model_1.default.findById(currentUserId);
        const targetUser = yield user_model_1.default.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ code: 404, message: "User to add not found" });
        }
        const isFriend = currentUser.friendList.some((friend) => friend.user_id.toString() === userId);
        if (isFriend) {
            return res.status(400).json({ code: 400, message: "Already friends" });
        }
        const alreadyRequested = currentUser.requestFriends.some((acc) => acc.user_id.toString() === userId);
        if (!alreadyRequested) {
            return res.status(404).json({ code: 404, message: "No friend requests sent" });
        }
        yield user_model_1.default.updateOne({ _id: currentUserId }, { $pull: { requestFriends: { user_id: userId } } }, { runValidators: true });
        yield user_model_1.default.updateOne({ _id: userId }, { $pull: { acceptFriends: { user_id: currentUserId } } }, { runValidators: true });
        res.status(201).json({ code: 201, message: "Cancel friend successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.cancelFriend = cancelFriend;
const refuseFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;
        const currentUser = yield user_model_1.default.findById(currentUserId);
        const targetUser = yield user_model_1.default.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ code: 404, message: "User to add not found" });
        }
        const isFriend = currentUser.friendList.some((friend) => friend.user_id.toString() === userId);
        if (isFriend) {
            return res.status(400).json({ code: 400, message: "Already friends" });
        }
        const alreadyAccept = currentUser.acceptFriends.some((acc) => acc.user_id.toString() === userId);
        if (!alreadyAccept) {
            res.status(404).json({ code: 404, message: "User has not sent friend request to me" });
        }
        yield user_model_1.default.updateOne({ _id: currentUserId }, { $pull: { acceptFriends: { user_id: userId } } }, { runValidators: true });
        yield user_model_1.default.updateOne({ _id: userId }, { $pull: { requestFriends: { user_id: currentUserId } } }, { runValidators: true });
        res.status(200).json({ code: 200, message: "Friend request rejected successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.refuseFriend = refuseFriend;
const acceptFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;
        const currentUser = yield user_model_1.default.findById(currentUserId);
        const targetUser = yield user_model_1.default.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ code: 404, message: "User to add not found" });
        }
        const isFriend = currentUser.friendList.some((friend) => friend.user_id.toString() === userId);
        if (isFriend) {
            return res.status(400).json({ code: 400, message: "Already friends" });
        }
        const alreadyAccept = currentUser.acceptFriends.some((acc) => acc.user_id.toString() === userId);
        if (!alreadyAccept) {
            res.status(404).json({ code: 404, message: "User has not sent friend request to me" });
        }
        const newRoomChat = new room_chat_model_1.default({
            typeRoom: "friend",
            users: [
                { user_id: currentUserId, role_room: "superAdmin" },
                { user_id: userId, role_room: "superAdmin" },
            ],
        });
        yield newRoomChat.save();
        yield user_model_1.default.updateOne({ _id: currentUserId }, {
            $push: { friendList: { user_id: userId, room_chat_id: newRoomChat.id } },
            $pull: { acceptFriends: { user_id: userId } },
        }, { runValidators: true });
        yield user_model_1.default.updateOne({ _id: userId }, {
            $push: { friendList: { user_id: currentUserId, room_chat_id: newRoomChat.id } },
            $pull: { requestFriends: { user_id: currentUserId } },
        }, { runValidators: true });
        res.status(200).json({ code: 200, message: "Accept friend successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.acceptFriend = acceptFriend;
const deleteFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;
        const currentUser = yield user_model_1.default.findById(currentUserId);
        const targetUser = yield user_model_1.default.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ code: 404, message: "User to add not found" });
        }
        const friend = currentUser.friendList.find((friend) => friend.user_id.toString() === userId);
        if (!friend) {
            return res.status(400).json({ code: 400, message: "Not friends with this user yet" });
        }
        yield room_chat_model_1.default.updateOne({ _id: friend.room_chat_id }, { deleted: true, deletedAt: new Date() }, { runValidators: true });
        yield user_model_1.default.updateOne({ _id: currentUserId }, { $pull: { friendList: { user_id: userId } } }, { runValidators: true });
        yield user_model_1.default.updateOne({ _id: userId }, { $pull: { friendList: { user_id: currentUserId } } }, { runValidators: true });
        res.status(200).json({ code: 200, message: "Delete friend successfully" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});
exports.deleteFriend = deleteFriend;
