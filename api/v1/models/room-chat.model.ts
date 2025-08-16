import { Schema, model } from "mongoose";

const RoomChatSchema = new Schema(
  {
    title: String,
    avatar: String,
    theme: String,
    typeRoom: { type: String, enum: ["group", "friend"] },
    status: String,
    lastMessage: { type: Schema.Types.ObjectId, ref: "Chat" },
    users: [
      {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role_room: { type: String, enum: ["superAdmin", "user", "admin"] },
        _id: false,
      },
    ],
    deleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true },
);

const RoomChat = model("RoomChat", RoomChatSchema, "room-chat");

export default RoomChat;
