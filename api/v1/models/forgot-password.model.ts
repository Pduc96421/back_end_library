import mongoose from "mongoose";

const forgotPasswordSchema = new mongoose.Schema(
  {
    email: String,
    otp: String,
    action: String,
    expireAt: { type: Date, expires: 300 },
  },
  { timestamps: true },
);

const ForgotPassword = mongoose.model("ForgotPassword", forgotPasswordSchema, "forgot-password");

export default ForgotPassword;
