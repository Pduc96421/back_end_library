import { model, Schema } from "mongoose";

const roleSchema = new Schema({
  name: String,
  description: String,
});

export default model("Role", roleSchema, "roles");
