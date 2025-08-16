import { Request, Response } from "express";
import RoomChat from "../models/room-chat.model";

// Post /api/v1/room-chat/create
export const createRoomChat = async (req: Request, res: Response): Promise<any> => {
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

    usersId.forEach((userId: any) => {
      dataRoomChat.users.push({ user_id: userId, role_room: "user" });
    });

    const room = new RoomChat(dataRoomChat);
    await room.save();

    res.status(200).json({ code: 200, message: "Create room chat successfully", result: room });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Get /api/v1/room-chat/list-friend
export const listRoomChat = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;

    const rooms = await RoomChat.find({ "users.user_id": currentUserId, deleted: false })
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
        const infoUser = u.user_id as any;
        infoUser.role_room = u.role_room;
        return infoUser;
      });

      let title = room.title;
      let avatar = room.avatar

      if (room.typeRoom === "friend") {
        const targetUser = users.find((u) => u._id.toString() !== currentUserId);
        if (targetUser) {
          title = targetUser.fullName;
          avatar = targetUser.avatarUrl;
        }
      }

      return {
        ...room,
        users,
        title,
        avatar,
      };
    });

    res.status(200).json({ code: 200, message: "Get list friend successfully", result });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Get /api/v1/room-chat/info/:roomId
export const getRoomChatByRoomId = async (req: Request, res: Response): Promise<any> => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user.id;

    const room = await RoomChat.findOne({ _id: roomId, deleted: false })
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
      const infoUser = u.user_id as any;
      infoUser.role_room = u.role_room;
      return infoUser;
    });

    if (room.typeRoom === "friend") {
      const targetUser = users.find((u) => u._id.toString() !== currentUserId);
      room.title = targetUser.fullName;
    }

    const result = { ...room, users };

    res.status(200).json({ code: 200, message: "Get room chat by roomId successfully", result: result });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Patch /api/v1/room-chat/update/:roomId
export const updateRoomChat = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;
    const { roomId } = req.params;

    const room = await RoomChat.findOne({ _id: roomId, deleted: false });

    if (!room) {
      return res.status(404).json({ code: 404, message: "Room not found" });
    }

    const isUserInRoom = room.users.some((u) => u.user_id._id.toString() === currentUserId);
    if (!isUserInRoom) {
      return res.status(403).json({ code: 403, message: "You are not a member of this room" });
    }

    await RoomChat.updateOne({ _id: roomId }, { $set: req.body }, { runValidators: true });

    res.status(200).json({ code: 200, message: "Update room chat successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Post /api/v1/room-chat/add-user/:roomId
export const addUserInRoomChat = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;
    const { roomId } = req.params;
    const { usersId }: { usersId: string[] } = req.body;

    if (!Array.isArray(usersId) || usersId.length === 0) {
      return res.status(400).json({ code: 400, message: "userIds must be a non-empty array" });
    }

    const room = await RoomChat.findOne({ _id: roomId, deleted: false });

    if (!room) {
      return res.status(404).json({ code: 404, message: "Room not found" });
    }

    const isMyUserInRoom = room.users.some((u) => u.user_id._id.toString() === currentUserId);
    if (!isMyUserInRoom) {
      return res.status(403).json({ code: 403, message: "You are not a member of this room" });
    }

    const existingUsersId = room.users.map((u) => u.user_id.toString());
    const newUsersId = usersId.filter((id: string) => !existingUsersId.includes(id));
    if (newUsersId.length === 0) {
      return res.status(400).json({ code: 400, message: "All users already in the room" });
    }

    const newUsers = newUsersId.map((id: string) => ({ user_id: id, role_room: "user" }));

    await RoomChat.updateOne({ _id: roomId }, { $push: { users: { $each: newUsers } } }, { runValidators: true });

    res.status(200).json({ code: 200, message: "Add user in room chat successfully", result: newUsersId });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Delete /api/v1/room-chat/:roomId/users/:userId
export const removeUserInRoomChat = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;
    const { roomId, userId } = req.params;

    const room = await RoomChat.findOne({ _id: roomId, deleted: false });

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

    await RoomChat.updateOne({ _id: roomId }, { $pull: { users: { user_id: userId } } }, { runValidators: true });

    res.status(200).json({ code: 200, message: "User removed from room successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Delete /api/v1/room-chat/:roomId/leave
export const leaveRoomChat = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;
    const { roomId } = req.params;

    const room = await RoomChat.findOne({ _id: roomId, deleted: false });

    if (!room) {
      return res.status(404).json({ code: 404, message: "Room not found" });
    }

    const userInRoom = room.users.find((u) => u.user_id.toString() === currentUserId);
    if (!userInRoom) {
      return res.status(403).json({ code: 403, message: "You are not a member of this room" });
    }

    if (userInRoom.role_room === "superAdmin") {
      const otherSuperAdmins = room.users.filter(
        (u) => u.user_id.toString() !== currentUserId && u.role_room === "superAdmin",
      );
      if (otherSuperAdmins.length === 0) {
        return res.status(400).json({
          code: 400,
          message: "You are the only superAdmin. Please assign another superAdmin before leaving.",
        });
      }
    }

    await RoomChat.updateOne(
      { _id: roomId },
      { $pull: { users: { user_id: currentUserId } } },
      { runValidators: true },
    );

    res.status(200).json({ code: 200, message: "You have left the room successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Patch /api/v1/room-chat/:roomId/change-super-admin/:newUserId
export const changeSuperAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;
    const { roomId, userId } = req.params;

    const room = await RoomChat.findOne({ _id: roomId, deleted: false });
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
    await room.save();

    res.status(200).json({ code: 200, message: "Transferred superAdmin successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Patch /api/v1/room-chat/:roomId/change-role-room
export const changeRoleRoom = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;
    const { roomId } = req.params;
    const { target_user_id, new_role } = req.body;

    const validRoles = ["user", "admin"];
    if (!validRoles.includes(new_role)) {
      return res.status(400).json({ code: 400, message: "Invalid role" });
    }

    const room = await RoomChat.findById(roomId);
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
    await room.save();

    res.status(200).json({ code: 200, message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};
