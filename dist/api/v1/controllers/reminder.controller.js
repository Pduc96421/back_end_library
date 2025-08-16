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
exports.deleteReminder = exports.updateReminder = exports.toggleReminder = exports.createReminder = exports.getReminderById = exports.getAllReminders = void 0;
const reminder_model_1 = __importDefault(require("../models/reminder.model"));
const document_model_1 = __importDefault(require("../models/document.model"));
const redis_queue_1 = require("../../../config/redis-queue");
const pagination_1 = require("../../../helpers/pagination");
const format_reminder_1 = require("../../../helpers/format-reminder");
const getAllReminders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const [reminders, total] = yield Promise.all([
            reminder_model_1.default.find({ user_id: userId }).sort({ remindAt: 1 }).skip(skip).limit(size),
            reminder_model_1.default.countDocuments({ user_id: userId }),
        ]);
        return res.status(200).json({
            code: 200,
            message: "Lấy danh sách nhắc nhở thành công",
            result: (0, format_reminder_1.formatPaginatedResponse)(reminders, page, size, total),
        });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getAllReminders = getAllReminders;
const getReminderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { reminderId } = req.params;
        const reminder = yield reminder_model_1.default.findOne({ _id: reminderId, user_id: userId });
        if (!reminder) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy nhắc nhở" });
        }
        const formattedReminder = (0, format_reminder_1.formatReminder)(reminder);
        return res.status(200).json({ code: 200, message: "Lấy nhắc nhở thành công", result: formattedReminder });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getReminderById = getReminderById;
const createReminder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { documentId } = req.params;
        const { title, description, remindAt } = req.body;
        if (!title || !description || !remindAt) {
            return res.status(400).json({ code: 400, message: "Thiếu thông tin nhắc nhở" });
        }
        const document = yield document_model_1.default.findById(documentId);
        if (!document) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
        }
        const reminder = yield reminder_model_1.default.create({
            title,
            description,
            remindAt: new Date(remindAt),
            user_id: userId,
            active: true,
            sent: false,
        });
        yield (0, redis_queue_1.scheduleReminder)(reminder);
        const formattedReminder = (0, format_reminder_1.formatReminder)(reminder);
        return res.status(201).json({ code: 201, message: "Tạo nhắc nhở thành công", result: formattedReminder });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.createReminder = createReminder;
const toggleReminder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { reminderId } = req.params;
        const reminder = yield reminder_model_1.default.findOne({ _id: reminderId, user_id: userId });
        if (!reminder) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy nhắc nhở" });
        }
        reminder.active = !reminder.active;
        reminder.sent = false;
        yield reminder.save();
        if (reminder.active && new Date(reminder.remindAt) > new Date()) {
            yield (0, redis_queue_1.scheduleReminder)(reminder);
        }
        const formattedReminder = (0, format_reminder_1.formatReminder)(reminder);
        return res
            .status(200)
            .json({ code: 200, message: `Đã ${reminder.active ? "bật" : "tắt"} nhắc nhở`, result: formattedReminder });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.toggleReminder = toggleReminder;
const updateReminder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { reminderId } = req.params;
        const { title, description, remindAt } = req.body;
        const updateData = {};
        if (title)
            updateData.title = title;
        if (description)
            updateData.description = description;
        if (remindAt) {
            updateData.remindAt = new Date(remindAt);
            updateData.sent = false;
        }
        const reminder = yield reminder_model_1.default.findOneAndUpdate({ _id: reminderId, user_id: userId }, updateData, { new: true });
        if (!reminder) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy nhắc nhở" });
        }
        const formattedReminder = (0, format_reminder_1.formatReminder)(reminder);
        return res.status(200).json({ code: 200, message: "Cập nhật nhắc nhở thành công", result: formattedReminder });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.updateReminder = updateReminder;
const deleteReminder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { reminderId } = req.params;
        const deleted = yield reminder_model_1.default.findOneAndDelete({ _id: reminderId, user_id: userId });
        if (!deleted) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy nhắc nhở" });
        }
        return res.status(200).json({ code: 200, message: "Xóa nhắc nhở thành công" });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.deleteReminder = deleteReminder;
