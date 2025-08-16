import { Request, Response } from "express";
import Chat from "../models/chat.model";
import RoomChat from "../models/room-chat.model";

// POST /api/v1/chats/send
export const sendMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    let { room_chat_id, content, reply_chat_id } = req.body;
    const currentUserId = req.user.id;

    const room = await RoomChat.findOne({ _id: room_chat_id, deleted: false });
    if (!room) {
      return res.status(404).json({ code: 404, message: "Room not found" });
    }

    const isMember = room.users.some((u) => u.user_id.toString() === currentUserId);
    if (!isMember) {
      return res.status(403).json({ code: 403, message: "You are not a member of this room" });
    }

    if (reply_chat_id) {
      const originalMessage = await Chat.findOne({ _id: reply_chat_id, room_chat_id, deleted: false });
      if (!originalMessage) {
        return res.status(400).json({ code: 400, message: "Reply target not found or invalid" });
      }
    }

    const chat = new Chat({ user_id: currentUserId, room_chat_id, content, reply_chat_id: reply_chat_id || null });
    await chat.save();

    await RoomChat.findByIdAndUpdate(room_chat_id, { lastMessage: chat._id });

    res.status(200).json({ code: 200, message: "Message sent", result: chat });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Post /api/v1/chats/send-file
export const sendFileMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const room_chat_id = req.body.room_chat_id;
    const reply_chat_id = req.body.reply_chat_id;
    const currentUserId = req.user.id;

    if (!req.body.file_url) {
      return res.status(400).json({ code: 400, message: "No file uploaded or invalid format" });
    }

    const room = await RoomChat.findOne({ _id: room_chat_id, deleted: false });
    if (!room) {
      return res.status(404).json({ code: 404, message: "Room not found" });
    }

    const isMember = room.users.some((u) => u.user_id.toString() === currentUserId);
    if (!isMember) {
      return res.status(403).json({ code: 403, message: "You are not a member of this room" });
    }

    const newMessage = new Chat({
      user_id: currentUserId,
      room_chat_id,
      type: "file",
      file_url: req.body.file_url, // URL từ Cloudinary
      file_name: req.file?.originalname || "", // tên gốc của file
      reply_chat_id: reply_chat_id || null,
    });
    await newMessage.save();

    await RoomChat.findByIdAndUpdate(room_chat_id, { lastMessage: newMessage._id });

    res.status(200).json({ code: 200, message: "File sent successfully", result: newMessage });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// GET /api/v1/chats/:roomId
export const getMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user.id;

    const room = await RoomChat.findOne({ _id: roomId, deleted: false });
    if (!room) {
      return res.status(404).json({ code: 404, message: "Room not found" });
    }

    if (req.user.role !== "ADMIN") {
      const isMember = room.users.some((u) => u.user_id.toString() === currentUserId);
      if (!isMember) {
        return res.status(403).json({ code: 403, message: "You are not a member of this room" });
      }
    }

    const messages = await Chat.find({ room_chat_id: roomId, deleted: false })
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
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Patch /api/v1/chats/update/:chatId
export const updateMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat || chat.deleted) {
      return res.status(404).json({ code: 404, message: "Chat not found" });
    }

    if (req.user.role !== "ADMIN") {
      if (chat.user_id.toString() !== currentUserId) {
        return res.status(403).json({ code: 403, message: "You can only update your own messages" });
      }
    }

    chat.content = content;
    await chat.save();

    res.status(200).json({ code: 200, message: "Message updated successfully", result: chat });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Patch /api/v1/chats/:chatId/react
export const reactMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { chatId } = req.params;
    const { icon } = req.body;
    const currentUserId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat || chat.deleted) {
      return res.status(404).json({ code: 404, message: "Message not found" });
    }

    const existingReactIndex = chat.reactions.findIndex((r) => r.user_id.toString() === currentUserId);

    if (existingReactIndex !== -1) {
      // Nếu icon giống nhau → huỷ reaction
      if (chat.reactions[existingReactIndex].icon === icon) {
        chat.reactions.splice(existingReactIndex, 1); // huỷ
      } else {
        chat.reactions[existingReactIndex].icon = icon; // update icon
      }
    } else {
      chat.reactions.push({ user_id: currentUserId, icon });
    }
    await chat.save();

    res.status(200).json({ code: 200, message: "React success", result: chat.reactions });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Get /api/v1/chats/:chatId/reactions
export const getReactions = async (req: Request, res: Response): Promise<any> => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate({
        path: "reactions.user_id",
        select: "username fullName avatarUrl",
      })
      .lean();
    if (!chat) {
      return res.status(404).json({ code: 404, message: "Message not found" });
    }

    const reactionCounts: Record<string, number> = {};
    const reactionUsers: Record<string, any[]> = {};

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
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// DELETE /api/v1/chats/:chatId
export const deleteMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat || chat.deleted) {
      return res.status(404).json({ code: 404, message: "Chat not found or already deleted" });
    }

    if (chat.user_id.toString() !== currentUserId) {
      return res.status(403).json({ code: 403, message: "You can only delete your own messages" });
    }

    chat.deleted = true;
    chat.deletedAt = new Date();
    await chat.save();

    res.status(200).json({ code: 200, message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Delete /api/v1/chats/delete-multiple
export const deleteMultipleMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const { chatIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(chatIds) || chatIds.length === 0) {
      return res.status(400).json({ code: 400, message: "chatIds must be a non-empty array" });
    }

    const chats = await Chat.find({ _id: { $in: chatIds }, deleted: false });

    if (req.user.role !== "ADMIN") {
      const unauthorized = chats.filter((chat) => chat.user_id.toString() !== userId);
      if (unauthorized.length > 0 && req.user.role !== "ADMIN") {
        return res.status(403).json({ code: 403, message: "You can only delete your own messages" });
      }
    }

    await Chat.updateMany({ _id: { $in: chatIds } }, { $set: { deleted: true, deletedAt: new Date() } });

    res.status(200).json({ code: 200, message: "Messages deleted successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};
