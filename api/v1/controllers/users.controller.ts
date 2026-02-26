import { Request, Response } from "express";
import User from "../models/user.model";
import RoomChat from "../models/room-chat.model";

// Get /api/v1/users/not-friend
export const getNotFriend = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;

    const myUser = await User.findOne({ _id: currentUserId, deleted: false });

    const requestFriends = myUser.requestFriends.map((item) => item.user_id);
    const acceptFriends = myUser.acceptFriends.map((item) => item.user_id);
    const friendList = myUser.friendList.map((item) => item.user_id);

    const users = await User.find({
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
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Get /api/v1/users/request  láy thông tin người dùng đã gửi lời mời kết bạn
export const getRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;

    const myUser = await User.findOne({ _id: currentUserId, deleted: false }).populate({
      path: "requestFriends.user_id",
      select: "username fullName email gender avatarUrl role dob",
    });

    if (!myUser) {
      return res.status(404).json({ code: 403, message: `User of ${currentUserId} not found` });
    }

    const users = myUser.requestFriends.map((item) => item.user_id);

    res.status(201).json({ code: 201, message: "Get request successfully", result: users });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Get /api/v1/users/accept lấy thông tin người dùng gửi lời mời kết bạn cho mình
export const getAccept = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;

    const myUser = await User.findOne({ _id: currentUserId, deleted: false }).populate({
      path: "acceptFriends.user_id",
      select: "username fullName email gender avatarUrl role dob",
    });

    if (!myUser) {
      return res.status(404).json({ code: 403, message: `User of ${currentUserId} not found` });
    }

    const users = myUser.acceptFriends.map((item) => item.user_id);

    res.status(201).json({ code: 201, message: "Get accept successfully", result: users });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Get /api/v1/users/friends
export const getFriends = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;

    const myUser = await User.findOne({ _id: currentUserId, deleted: false })
      .populate({
        path: "friendList.user_id",
        select: "username fullName email gender avatarUrl role dob",
      })
      .lean();

    if (!myUser) {
      return res.status(404).json({ code: 403, message: `User of ${currentUserId} not found` });
    }

    const users = myUser.friendList.map((item) => {
      const user = item.user_id as any;
      user.room_chat_id = item.room_chat_id.toString();
      return user;
    });

    res.status(201).json({ code: 201, message: "Get friends successfully", result: users });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Post /api/v1/users/add-friend/:userId
export const addFriend = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ code: 404, message: "User to add not found" });
    }

    // Đã là bạn bè
    const isFriend = currentUser.friendList.some((friend) => friend.user_id.toString() === userId);
    if (isFriend) {
      return res.status(400).json({ code: 400, message: "Already friends" });
    }

    // Đã gửi lời mời
    const alreadyRequested = currentUser.requestFriends.some((acc) => acc.user_id.toString() === userId);
    if (alreadyRequested) {
      return res.status(400).json({ code: 400, message: "Friend request already sent" });
    }

    // Đã nhận lời mời từ user kia (tức là họ gửi trước mình => nên cho phép Accept thay vì gửi lại)
    const hasReceivedRequest = currentUser.acceptFriends.some((acc) => acc.user_id.toString() === userId);
    if (hasReceivedRequest) {
      return res.status(400).json({ code: 400, message: "User has already sent you a friend request" });
    }

    // Gửi lời mời kết bạn
    await User.updateOne(
      { _id: currentUserId },
      { $push: { requestFriends: { user_id: userId } } },
      { runValidators: true },
    );

    await User.updateOne(
      { _id: userId },
      { $push: { acceptFriends: { user_id: currentUserId } } },
      { runValidators: true },
    );

    res.status(201).json({ code: 201, message: "Add friend successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Post /api/v1/users/cancel-friend/:userId
export const cancelFriend = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

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

    await User.updateOne(
      { _id: currentUserId },
      { $pull: { requestFriends: { user_id: userId } } },
      { runValidators: true },
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { acceptFriends: { user_id: currentUserId } } },
      { runValidators: true },
    );

    res.status(201).json({ code: 201, message: "Cancel friend successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Post /api/v1/users/refuse-friend/:userId
export const refuseFriend = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

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

    await User.updateOne(
      { _id: currentUserId },
      { $pull: { acceptFriends: { user_id: userId } } },
      { runValidators: true },
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { requestFriends: { user_id: currentUserId } } },
      { runValidators: true },
    );

    res.status(200).json({ code: 200, message: "Friend request rejected successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Post /api/v1/users/accept-friend/:userId
export const acceptFriend = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

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

    const newRoomChat = new RoomChat({
      typeRoom: "friend",
      users: [
        { user_id: currentUserId, role_room: "superAdmin" },
        { user_id: userId, role_room: "superAdmin" },
      ],
    });
    await newRoomChat.save();

    await User.updateOne(
      { _id: currentUserId },
      {
        $push: { friendList: { user_id: userId, room_chat_id: newRoomChat.id } },
        $pull: { acceptFriends: { user_id: userId } },
      },
      { runValidators: true },
    );

    await User.updateOne(
      { _id: userId },
      {
        $push: { friendList: { user_id: currentUserId, room_chat_id: newRoomChat.id } },
        $pull: { requestFriends: { user_id: currentUserId } },
      },
      { runValidators: true },
    );

    res.status(200).json({ code: 200, message: "Accept friend successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// Delete /api/v1/users/delete-friend/:userId
export const deleteFriend = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ code: 404, message: "User to add not found" });
    }

    const friend = currentUser.friendList.find((friend) => friend.user_id.toString() === userId);
    if (!friend) {
      return res.status(400).json({ code: 400, message: "Not friends with this user yet" });
    }

    await RoomChat.updateOne(
      { _id: friend.room_chat_id },
      { deleted: true, deletedAt: new Date() },
      { runValidators: true },
    );

    await User.updateOne(
      { _id: currentUserId },
      { $pull: { friendList: { user_id: userId } } },
      { runValidators: true },
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { friendList: { user_id: currentUserId } } },
      { runValidators: true },
    );

    res.status(200).json({ code: 200, message: "Delete friend successfully" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};
