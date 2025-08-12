import Queue from "bull";
import Reminder from "../api/v1/models/reminder.model";
import User from "../api/v1/models/user.model";
import { sendEmail } from "../helpers/sendMail";

// Tạo queue cho reminder
const reminderQueue = new Queue("reminder-queue", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

// Xử lý jobs trong queue
reminderQueue.process(async (job) => {
  const { reminder } = job.data;

  try {
    const user = await User.findById(reminder.user_id);
    if (!user || !user.email) return;

    const subject = `Nhắc nhở: ${reminder.title}`;
    const html = `
      <h2>Xin chào ${user.username || user.email}!</h2>
      <p>Bạn có một nhắc nhở về tài liệu:</p>
      <p><strong>Tiêu đề:</strong> ${reminder.title}</p>
      <p><strong>Mô tả:</strong> ${reminder.description}</p>
      <p><strong>Thời gian:</strong> ${new Date(reminder.remindAt).toLocaleString("vi-VN")}</p>
    `;

    await sendEmail(user.email, subject, html);
    await Reminder.findByIdAndUpdate(reminder._id, { sent: true });

    console.log(`Sent reminder ${reminder._id} to ${user.email}`);
  } catch (error) {
    console.error(`Failed to process reminder ${reminder._id}:`, error);
    throw error; // Để Bull retry job
  }
});

// Thêm reminder vào queue
export const scheduleReminder = async (reminder: any) => {
  const delay = new Date(reminder.remindAt).getTime() - Date.now();

  if (delay > 0) {
    await reminderQueue.add(
      { reminder },
      {
        delay,
        attempts: 3, // Số lần retry nếu fail
        backoff: {
          type: "exponential",
          delay: 1000, // Delay giữa các lần retry
        },
      },
    );
    console.log(`Scheduled reminder ${reminder._id} for ${reminder.remindAt}`);
  }
};
