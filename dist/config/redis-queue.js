"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleReminder = void 0;
const bull_1 = __importDefault(require("bull"));
const reminder_model_1 = __importDefault(require("../api/v1/models/reminder.model"));
const user_model_1 = __importDefault(require("../api/v1/models/user.model"));
const sendMail_1 = require("../helpers/sendMail");
const reminderQueue = new bull_1.default("reminder-queue", {
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
    },
});
reminderQueue.process((job) => __awaiter(void 0, void 0, void 0, function* () {
    const { reminder } = job.data;
    try {
        const user = yield user_model_1.default.findById(reminder.user_id);
        if (!user || !user.email)
            return;
        const subject = `Nhắc nhở: ${reminder.title}`;
        const html = `
      <h2>Xin chào ${user.username || user.email}!</h2>
      <p>Bạn có một nhắc nhở về tài liệu:</p>
      <p><strong>Tiêu đề:</strong> ${reminder.title}</p>
      <p><strong>Mô tả:</strong> ${reminder.description}</p>
      <p><strong>Thời gian:</strong> ${new Date(reminder.remindAt).toLocaleString("vi-VN")}</p>
    `;
        yield (0, sendMail_1.sendEmail)(user.email, subject, html);
        yield reminder_model_1.default.findByIdAndUpdate(reminder._id, { sent: true });
        console.log(`Sent reminder ${reminder._id} to ${user.email}`);
    }
    catch (error) {
        console.error(`Failed to process reminder ${reminder._id}:`, error);
        throw error;
    }
}));
const scheduleReminder = (reminder) => __awaiter(void 0, void 0, void 0, function* () {
    const delay = new Date(reminder.remindAt).getTime() - Date.now();
    if (delay > 0) {
        yield reminderQueue.add({ reminder }, {
            delay,
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        });
        console.log(`Scheduled reminder ${reminder._id} for ${reminder.remindAt}`);
    }
});
exports.scheduleReminder = scheduleReminder;
