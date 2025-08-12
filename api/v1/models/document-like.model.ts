import { Schema, model } from "mongoose";

const documentLikeSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    document_id: { type: Schema.Types.ObjectId, ref: "Document", required: true },
  },
  { timestamps: true },
);

export default model("DocumentLike", documentLikeSchema, "document_likes");
