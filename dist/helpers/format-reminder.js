"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatReminder = formatReminder;
exports.formatPaginatedResponse = formatPaginatedResponse;
function formatReminder(reminder) {
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
function formatPaginatedResponse(reminders, page, size, total) {
    return {
        content: reminders.map(formatReminder),
        page,
        size,
        totalElements: total,
        totalPages: Math.ceil(total / size),
    };
}
