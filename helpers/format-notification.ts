import { Types } from "mongoose";

interface NotificationResponse {
  id: Types.ObjectId;
  title: string;
  description: string;
  createdAt: Date;
  documentId: Types.ObjectId;
  read: boolean;
}

export async function mapNotificationToResponse(notification: any): Promise<NotificationResponse> {
  return {
    id: notification._id,
    title: notification.title,
    description: notification.description,
    createdAt: notification.createdAt,
    documentId: notification.document_id,
    read: notification.read
  };
}