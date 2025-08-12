import { model, Schema } from "mongoose";

const libraryDocumentSchema = new Schema(
  {
    document_id: { type: Schema.Types.ObjectId, ref: "Document" },
    library_id: { type: Schema.Types.ObjectId, ref: "UserLibrary" },
    status: { type: String, enum: ["UNREAD", "COMPLETED"], default: "UNREAD" },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    note: String,
    category: String,
  },
  { timestamps: true },
);

export default model("LibraryDocument", libraryDocumentSchema, "library_documents");
