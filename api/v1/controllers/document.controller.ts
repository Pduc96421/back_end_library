import { Request, Response } from "express";
import Document from "../models/document.model";
import Tag from "../models/tag.model";
import {
  formatSearchDocument,
  getAccessibleDocumentIds,
  mapDocumentToResponse,
} from "../../../helpers/format-document";
import { getPagination } from "../../../helpers/pagination";
import DocumentTag from "../models/document-tag.model";
import DocumentView from "../models/document-view.model";
import DocumentLike from "../models/document-like.model";
import DocumentDownload from "../models/document-download.model";
import DocumentAccess from "../models/document-access.model";
import DocumentRating from "../models/document-rating.model";
import User from "../models/user.model";

let find: any = { status: "APPROVED", is_public: true };

// Get /documents/all-document
export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    const myUser = (req as any).local.user;
    const { page, size, skip } = getPagination(req.query);
    let documents = [];
    let totalElements: number = 0;
    if (myUser?.role === "ADMIN") {
      documents = await Document.find().skip(skip).limit(size);
      totalElements = await Document.countDocuments();
    } else {
      documents = await Document.find(find).skip(skip).limit(size);
      totalElements = await Document.countDocuments(find);
    }

    const totalPages = Math.ceil(totalElements / size);

    const content = await Promise.all(documents.map(mapDocumentToResponse));

    const result = { content, page, size, totalElements, totalPages };

    return res.status(200).json({ code: 200, message: "Lấy danh sách tài liệu thành công", result });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /documents/top-document
export const getTopDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await Document.find(find).sort({ views: -1 }).limit(10);
    const content = await Promise.all(documents.map(mapDocumentToResponse));

    return res.status(200).json({ code: 200, message: "Lấy top tài liệu thành công", result: content });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /documents/search
export const searchDocuments = async (req: Request, res: Response) => {
  try {
    const { page, size, skip } = getPagination(req.query);
    const { keyword, tag } = req.query;
    let query: any = { status: "APPROVED", is_public: true };

    if (keyword) {
      query = {
        ...query,
        $or: [{ title: { $regex: keyword, $options: "i" } }, { description: { $regex: keyword, $options: "i" } }],
      };
    }

    if (tag) {
      const foundTags = await Tag.find({ name: { $regex: tag, $options: "i" } });

      if (foundTags.length > 0) {
        const tagIds = foundTags.map((t) => t._id);
        const docTags = await DocumentTag.find({ tag_id: { $in: tagIds } }).populate("document_id");

        if (docTags.length > 0) {
          const documentIds = docTags.map((dt) => dt.document_id);
          query._id = { $in: documentIds };
        } else {
          return res.status(200).json({
            code: 200,
            message: "Tìm kiếm tài liệu thành công",
            result: { content: [], page, size, totalElements: 0, totalPages: 0 },
          });
        }
      }
    }

    const [documents, totalElements] = await Promise.all([
      Document.find(query).sort({ createdAt: -1 }).skip(skip).limit(size),
      Document.countDocuments(query),
    ]);

    const content = await Promise.all(documents.map(formatSearchDocument));

    return res.status(200).json({
      code: 200,
      message: "Tìm kiếm tài liệu thành công",
      result: { content, page, size, totalElements, totalPages: Math.ceil(totalElements / size) },
    });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /documents/pending
export const getPendingDocuments = async (req: Request, res: Response) => {
  try {
    const { page, size, skip } = getPagination(req.query);
    const documents = await Document.find({ status: "PENDING" }).skip(skip).limit(size);

    const totalElements = await Document.countDocuments();
    const totalPages = Math.ceil(totalElements / size);
    const content = await Promise.all(documents.map(mapDocumentToResponse));

    const result = { content, page, size, totalElements, totalPages };

    return res.status(200).json({ code: 200, message: "Lấy tài liệu chờ duyệt thành công", result: result });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /documents/user
export const getDocumentOfUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { page, size, skip } = getPagination(req.query);
    const documents = await Document.find({ created_by: userId }).skip(skip).limit(size);

    const totalElements = await Document.countDocuments();
    const totalPages = Math.ceil(totalElements / size);
    const content = await Promise.all(documents.map(mapDocumentToResponse));

    const result = { content, page, size, totalElements, totalPages };
    return res.status(200).json({ code: 200, message: "Lấy tài liệu của người dùng thành công", result: result });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /documents/user/share-document
export const getSharedDocuments = async (req: Request, res: Response) => {
  return res.status(200).json({ code: 200, message: "Lấy tài liệu chia sẻ thành công", result: [] });
};

// Get /documents/:documentId/detail
export const getDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = (req as any).user?.id;
    const document = await Document.findOne({
      _id: documentId,
      $or: [find, { created_by: userId }, { _id: { $in: await getAccessibleDocumentIds(userId) } }],
    });

    if (!document) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu hoặc bạn không có quyền truy cập" });
    }

    const isLiked = userId ? await DocumentLike.exists({ document_id: documentId, user_id: userId }) : false;

    await DocumentView.create({ document_id: documentId, user_id: userId });
    const content = await mapDocumentToResponse(document);

    return res
      .status(200)
      .json({ code: 200, message: "Lấy chi tiết tài liệu thành công", result: { ...content, liked: !!isLiked } });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Patch /documents/:documentId
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = (req as any).user?.id;
    const updateData = req.body;
    const document = await Document.findByIdAndUpdate(
      documentId,
      { updateData, modified_by: userId },
      { new: true, runValidators: true },
    );
    if (!document) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
    }
    return res.status(200).json({ code: 200, message: "Cập nhật tài liệu thành công", result: document });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Delete /documents/:documentId
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const deleted = await Document.findByIdAndDelete(documentId);
    if (!deleted) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
    }
    return res.status(200).json({ code: 200, message: "Xóa tài liệu thành công" });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Put /documents/:documentId/approve
export const approveDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findByIdAndUpdate(documentId, { status: "APPROVED" }, { new: true });
    if (!document) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
    }
    const content = await mapDocumentToResponse(document);

    return res.status(200).json({ code: 200, message: "Duyệt tài liệu thành công", result: content });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Put /documents/:documentId/reject
export const rejectDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findByIdAndUpdate(documentId, { status: "REJECTED" }, { new: true });
    if (!document) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
    }
    const content = await mapDocumentToResponse(document);

    return res.status(200).json({ code: 200, message: "Từ chối tài liệu thành công", result: content });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /documents/:documentId/like
export const likeDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = (req as any).user?.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
    }

    const existingLike = await DocumentLike.findOne({ document_id: documentId, user_id: userId });

    if (existingLike) {
      return res.status(400).json({ code: 400, message: "Bạn đã like tài liệu này rồi" });
    }

    await DocumentLike.create({ document_id: documentId, user_id: userId });

    const content = await mapDocumentToResponse(document);
    return res.status(200).json({ code: 200, message: "Like tài liệu thành công", result: content });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Delete /documents/:documentId/like
export const unlikeDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = (req as any).user?.id;

    const deleted = await DocumentLike.findOneAndDelete({ document_id: documentId, user_id: userId });

    if (!deleted) {
      return res.status(404).json({ code: 404, message: "Bạn chưa like tài liệu này" });
    }

    return res.status(200).json({ code: 200, message: "Bỏ like tài liệu thành công" });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /documents/:documentId/access
export const changeAccess = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { email, accessType } = req.body;
    const currentUserId = (req as any).user?.id;

    const document = await Document.findOne({ _id: documentId, created_by: currentUserId, is_public: false });

    const targetUser = await User.findOne({ email, status: "ACTIVE" });
    if (!targetUser) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng với email này" });
    }

    if (!document) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu hoặc bạn không có quyền thay đổi" });
    }

    const access = await DocumentAccess.findOneAndUpdate(
      { document_id: documentId, user_id: targetUser._id },
      { document_id: documentId, user_id: targetUser._id, access_type: accessType },
      { upsert: true, new: true, runValidators: true },
    );

    return res.status(200).json({ code: 200, message: "Thay đổi quyền truy cập thành công", result: access });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /documents/:documentId/download
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = (req as any).user?.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
    }

    await DocumentDownload.create({ document_id: documentId, user_id: userId });

    return res
      .status(200)
      .json({ code: 200, message: "Tải tài liệu thành công", result: { downloadUrl: document.file_url } });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /documents/:documentId/rate
export const rateDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = (req as any).user?.id;
    const { rating, review } = req.body;

    const document = await Document.findOne({ _id: documentId, status: "APPROVED" });

    if (!document) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu hoặc tài liệu chưa được duyệt" });
    }

    // Update or create rating
    const documentRating = await DocumentRating.findOneAndUpdate(
      { document_id: documentId, user_id: userId },
      { rating, review: review || "", document_id: documentId, user_id: userId },
      { upsert: true, new: true, runValidators: true },
    );

    const content = await mapDocumentToResponse(document);

    return res.status(200).json({
      code: 200,
      message: "Đánh giá tài liệu thành công",
      result: { rating: documentRating, document: content },
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Post /documents/upload
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { title, description, is_public, category_id, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ code: 400, message: "File không tồn tại" });
    }

    if (!req.body.file) {
      return res.status(400).json({ code: 400, message: "Không tìm thấy URL của file" });
    }

    const file_url = req.body.file;
    const file_type = file.mimetype;
    const file_size = file.size;
    const preview_urls = req.body.preview_urls || [];

    const document = await Document.create({
      title,
      description,
      file_type,
      file_url,
      file_size,
      is_public,
      category_id,
      created_by: userId,
      status: "PENDING",
      preview_urls,
    });

    let tagList = [];
    if (tags && Array.isArray(tags)) {
      tagList = await Promise.all(
        tags.map(async (tagName: string) => {
          let tag = await Tag.findOne({ name: tagName });
          if (!tag) {
            tag = await Tag.create({ name: tagName });
          }

          await DocumentTag.create({ document_id: document._id, tag_id: tag._id });

          return { id: tag._id, name: tag.name };
        }),
      );
    }

    return res.status(201).json({
      code: 201,
      message: "Tải lên tài liệu thành công",
      result: { ...document.toObject(), tags: tagList, preview_urls },
    });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

export const getAllTags = async (req: Request, res: Response) => {
  try {
    const tags = await Tag.find();

    const content = tags.map((tag) => ({ id: tag._id, name: tag.name }));

    return res.status(200).json({
      code: 200,
      message: "Lấy tất cả thẻ thành công",
      result: content,
    });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};
