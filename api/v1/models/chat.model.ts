import { Schema, model } from "mongoose";

const ChatSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    room_chat_id: { type: Schema.Types.ObjectId, ref: "RoomChat", required: true },
    reply_chat_id: { type: Schema.Types.ObjectId, ref: "Chat", default: null },
    content: String,
    file_url: String,
    file_name: String,
    deleted: { type: Boolean, default: false },
    deletedAt: Date,
    reactions: [
      {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        icon: { type: String, required: true, enum: ["❤️", "👍", "😂", "😮", "😢", "😡"] },
        _id: false,
      },
    ],
  },
  { timestamps: true },
);

const Chat = model("Chat", ChatSchema, "chat");

export default Chat;
