import { model, Schema } from "mongoose";

const documentAccessSchema = new Schema(
  {
    document_id: { type: Schema.Types.ObjectId, ref: "Document" },
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    access_type: { type: String, enum: ["VIEW", "DOWNLOAD", "EDIT"] },
  },
  { timestamps: true },
);

export default model("DocumentAccess", documentAccessSchema, "document_access");
