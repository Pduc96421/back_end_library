import { Schema, model } from "mongoose";

const documentSchema = new Schema(
  {
    title: String,
    description: String,
    downloadable: Boolean,
    preview_urls: [String],
    file_type: String,
    file_url: String,
    file_size: Number,
    is_public: Boolean,
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"] },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    modified_by: { type: Schema.Types.ObjectId, ref: "User" },
    category_id: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true },
);

const Document = model("Document", documentSchema, "documents");

export default Document;
