import { model, Schema } from "mongoose";

const documentViewSchema = new Schema(
  {
    document_id: { type: Schema.Types.ObjectId, ref: "Document" },
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default model("DocumentView", documentViewSchema, "document_views");
