import { Request, Response } from "express";
import DocumentComment from "../models/document-comment.model";
import { getPagination } from "../../../helpers/pagination";
import { mapCommentToResponse } from "../../../helpers/format-comment";

// Get /comments/:documentId
export const getComments = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { page, size, skip } = getPagination(req.query);

    const findComments = { document_id: documentId, parent_id: null };

    const comments = await DocumentComment.find(findComments)
      .populate("user_id", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    const totalElements = await DocumentComment.countDocuments(findComments);
    const totalPages = Math.ceil(totalElements / size);
    const content = await Promise.all(comments.map(mapCommentToResponse));

    return res.status(200).json({
      code: 200,
      message: "Lấy bình luận thành công",
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

// Post /comments/:documentId
export const addComment = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = (req as any).user?.id;
    const { content, parent_id } = req.body;

    const comment = await DocumentComment.create({
      content,
      user_id: userId,
      document_id: documentId,
      parent_id: parent_id || null,
    });
    return res.status(201).json({ code: 201, message: "Thêm bình luận thành công", result: comment });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /comments/:commentId/replies
export const getCommentReplies = async (req: Request, res: Response) => {
  try {
    const { documentId, commentId } = req.params;
    const { page, size, skip } = getPagination(req.query);
    const findComments = { document_id: documentId, parent_id: commentId };

    const comments = await DocumentComment.find(findComments)
      .populate("user_id", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    const totalElements = await DocumentComment.countDocuments(findComments);
    const totalPages = Math.ceil(totalElements / size);
    const content = await Promise.all(comments.map(mapCommentToResponse));

    return res.status(200).json({
      code: 200,
      message: "Lấy bình luận thành công",
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

// Post /comments/:documentId/:commentId/like
export const likeComment = async (req: Request, res: Response) => {
  try {
    const { documentId, commentId } = req.params;
    const comment = await DocumentComment.findOneAndUpdate(
      { _id: commentId, document_id: documentId },
      { $inc: { likes_count: 1 } },
      { new: true },
    );
    if (!comment) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy bình luận" });
    }
    return res.status(200).json({ code: 200, message: "Like bình luận thành công", result: comment });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Delete /comments/:documentId/:commentId/like
export const unlikeComment = async (req: Request, res: Response) => {
  try {
    const { documentId, commentId } = req.params;
    const comment = await DocumentComment.findOneAndUpdate(
      { _id: commentId, document_id: documentId },
      { $inc: { likes_count: -1 } },
      { new: true },
    );
    if (!comment) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy bình luận" });
    }
    return res.status(200).json({ code: 200, message: "Bỏ like bình luận thành công", result: comment });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Delete /comments/:commentId
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const deleted = await DocumentComment.findByIdAndDelete(commentId);
    if (!deleted) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy bình luận" });
    }
    return res.status(200).json({ code: 200, message: "Xóa bình luận thành công" });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};
