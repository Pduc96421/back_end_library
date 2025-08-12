import { model, Schema } from "mongoose";

const userLibrarySchema = new Schema(
  {
    name: String,
    description: String,
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default model("UserLibrary", userLibrarySchema, "user_libraries");
