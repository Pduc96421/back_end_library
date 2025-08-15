import { Types } from "mongoose";

interface ReminderResponse {
  id: Types.ObjectId;
  title: string;
  description: string;
  remindAt: Date;
  active: boolean;
  sent: boolean;
  createdAt: Date;
    updatedAt: Date;
}

interface PaginatedResponse {
  content: ReminderResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export function formatReminder(reminder: any): ReminderResponse {
  return {
    id: reminder._id,
    title: reminder.title,
    description: reminder.description,
    remindAt: reminder.remindAt,
    active: reminder.active,
    sent: reminder.sent,
    createdAt: reminder.createdAt,
    updatedAt: reminder.updatedAt
  };
}

export function formatPaginatedResponse(
  reminders: any[],
  page: number,
  size: number,
  total: number,
): PaginatedResponse {
  return {
    content: reminders.map(formatReminder),
    page,
    size,
    totalElements: total,
    totalPages: Math.ceil(total / size),
  };
}
