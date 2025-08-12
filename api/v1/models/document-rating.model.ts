import { model, Schema } from "mongoose";

const documentRatingSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    document_id: { type: Schema.Types.ObjectId, ref: "Document" },
    rating: Number,
    review: String,
  },
  { timestamps: true },
);

export default model("DocumentRating", documentRatingSchema, "document_ratings");
