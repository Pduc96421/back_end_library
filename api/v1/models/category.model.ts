import { model, Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: String,
    description: String,
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true },
);

export default model("Category", categorySchema, "categories");
