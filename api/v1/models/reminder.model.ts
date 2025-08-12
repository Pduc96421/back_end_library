import { model, Schema } from "mongoose";

const reminderSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    remindAt: { type: Date, required: true },
    active: { type: Boolean, default: true },
    sent: { type: Boolean, default: false },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default model("Reminder", reminderSchema, "reminders");
