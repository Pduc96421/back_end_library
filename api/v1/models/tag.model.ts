import { model, Schema } from "mongoose";

const tagSchema = new Schema(
  {
    name: String,
  },
  { timestamps: true },
);

export default model("Tag", tagSchema, "tags");
