import { Request, Response } from "express";
import Reminder from "../models/reminder.model";
import Document from "../models/document.model";
import { scheduleReminder } from "../../../config/redis-queue";
import { getPagination } from "../../../helpers/pagination";
import { formatPaginatedResponse, formatReminder } from "../../../helpers/format-reminder";

export const getAllReminders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { page, size, skip } = getPagination(req.query);

    const [reminders, total] = await Promise.all([
      Reminder.find({ user_id: userId }).sort({ remindAt: 1 }).skip(skip).limit(size),
      Reminder.countDocuments({ user_id: userId }),
    ]);

    return res.status(200).json({
      code: 200,
      message: "Lấy danh sách nhắc nhở thành công",
      result: formatPaginatedResponse(reminders, page, size, total),
    });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

export const getReminderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { reminderId } = req.params;

    const reminder = await Reminder.findOne({ _id: reminderId, user_id: userId });

    if (!reminder) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy nhắc nhở" });
    }

    const formattedReminder = formatReminder(reminder);
    return res.status(200).json({ code: 200, message: "Lấy nhắc nhở thành công", result: formattedReminder });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

export const createReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { documentId } = req.params;
    const { title, description, remindAt } = req.body;

    if (!title || !description || !remindAt) {
      return res.status(400).json({ code: 400, message: "Thiếu thông tin nhắc nhở" });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
    }

    const reminder = await Reminder.create({
      title,
      description,
      remindAt: new Date(remindAt),
      user_id: userId,
      active: true,
      sent: false,
    });
    await scheduleReminder(reminder);

    const formattedReminder = formatReminder(reminder);

    return res.status(201).json({ code: 201, message: "Tạo nhắc nhở thành công", result: formattedReminder });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

export const toggleReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { reminderId } = req.params;

    const reminder = await Reminder.findOne({ _id: reminderId, user_id: userId });

    if (!reminder) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy nhắc nhở" });
    }

    reminder.active = !reminder.active;
    reminder.sent = false;
    await reminder.save();

    if (reminder.active && new Date(reminder.remindAt) > new Date()) {
      await scheduleReminder(reminder);
    }

    const formattedReminder = formatReminder(reminder);
    return res
      .status(200)
      .json({ code: 200, message: `Đã ${reminder.active ? "bật" : "tắt"} nhắc nhở`, result: formattedReminder });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

export const updateReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { reminderId } = req.params;
    const { title, description, remindAt } = req.body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (remindAt) {
      updateData.remindAt = new Date(remindAt);
      updateData.sent = false;
    }

    const reminder = await Reminder.findOneAndUpdate({ _id: reminderId, user_id: userId }, updateData, { new: true });

    if (!reminder) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy nhắc nhở" });
    }

    const formattedReminder = formatReminder(reminder);
    return res.status(200).json({ code: 200, message: "Cập nhật nhắc nhở thành công", result: formattedReminder });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { reminderId } = req.params;

    const deleted = await Reminder.findOneAndDelete({ _id: reminderId, user_id: userId });

    if (!deleted) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy nhắc nhở" });
    }

    return res.status(200).json({ code: 200, message: "Xóa nhắc nhở thành công" });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};
