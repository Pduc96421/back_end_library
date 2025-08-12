import { model, Schema } from "mongoose";

const documentCommentSchema = new Schema(
  {
    content: String,
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    document_id: { type: Schema.Types.ObjectId, ref: "Document" },
    parent_id: { type: Schema.Types.ObjectId, ref: "DocumentComment" },
    likes_count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default model("DocumentComment", documentCommentSchema, "document_comments");
