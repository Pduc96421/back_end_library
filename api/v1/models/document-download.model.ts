import { model, Schema } from "mongoose";

const documentDownloadSchema = new Schema(
  {
    document_id: { type: Schema.Types.ObjectId, ref: "Document" },
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    download_count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default model("DocumentDownload", documentDownloadSchema, "document_downloads");
