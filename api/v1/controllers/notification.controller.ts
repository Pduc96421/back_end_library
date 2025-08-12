import { Request, Response } from "express";
import Document from "../models/document.model";
import { getPagination } from "../../../helpers/pagination";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { page, size, skip } = getPagination(req.query);

    const documents = await Document.aggregate([
      {
        $addFields: {
          pendingFirst: {
            $cond: [{ $eq: ["$status", "PENDING"] }, 0, 1],
          },
        },
      },
      {
        $sort: {
          pendingFirst: 1,
          createdAt: -1,
        },
      },
      { $skip: skip },
      { $limit: size },
      {
        $lookup: {
          from: "users",
          localField: "created_by",
          foreignField: "_id",
          as: "created_by",
        },
      },
      { $unwind: "$created_by" },
      {
        $project: {
          pendingFirst: 0,
        },
      },
    ]);

    const totalElements = await Document.countDocuments({});
    const totalPages = Math.ceil(totalElements / size);

    const content = documents.map((doc) => ({
      id: doc._id,
      title: getNotificationTitle(doc.status),
      description: getNotificationDescription(doc),
      createdAt: doc.createdAt,
      documentId: doc._id,
      read: doc.status === "APPROVED" || doc.status === "REJECTED",
    }));

    return res.status(200).json({
      code: 200,
      message: "Lấy thông báo thành công",
      result: {
        content,
        page,
        size,
        totalElements,
        totalPages,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Helper functions for notification text
function getNotificationTitle(status: string): string {
  switch (status) {
    case "PENDING":
      return "Tài liệu mới cần duyệt";
    case "APPROVED":
      return "Tài liệu đã được duyệt";
    case "REJECTED":
      return "Tài liệu đã bị từ chối";
    default:
      return "Thông báo tài liệu";
  }
}

function getNotificationDescription(doc: any): string {
  const username = (doc.created_by as any)?.username || "Người dùng";

  switch (doc.status) {
    case "PENDING":
      return `Tài liệu "${doc.title}" được tải lên bởi ${username} đang chờ duyệt`;
    case "APPROVED":
      return `Tài liệu "${doc.title}" được tải lên bởi ${username} đã được duyệt`;
    case "REJECTED":
      return `Tài liệu "${doc.title}" được tải lên bởi ${username} đã bị từ chối`;
    default:
      return `Tài liệu "${doc.title}" được tải lên bởi ${username}`;
  }
}
