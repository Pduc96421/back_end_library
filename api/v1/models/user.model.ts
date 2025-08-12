import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    full_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phone_number: { type: String },
    avatarUrl: { type: String, default: "https://cdn-icons-png.flaticon.com/512/149/149071.png" },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], default: "OTHER" },
    dob: Date,
    role: { type: String, ref: "Role", enum: ["ADMIN", "USER"], default: "USER" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "LOCKED"], default: "ACTIVE" },
    email_verified: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    token: { type: String, select: false },
  },
  { timestamps: true },
);

export const User = model("User", userSchema, "users");
export default User;
