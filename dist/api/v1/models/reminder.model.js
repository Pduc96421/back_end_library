"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reminderSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    remindAt: { type: Date, required: true },
    active: { type: Boolean, default: true },
    sent: { type: Boolean, default: false },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Reminder", reminderSchema, "reminders");
