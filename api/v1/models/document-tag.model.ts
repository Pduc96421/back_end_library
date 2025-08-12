import { model, Schema } from "mongoose";

const documentTagSchema = new Schema(
  {
    document_id: { type: Schema.Types.ObjectId, ref: "Document" },
    tag_id: { type: Schema.Types.ObjectId, ref: "Tag" },
  },
  { timestamps: true },
);

export default model("DocumentTag", documentTagSchema, "document_tags");
