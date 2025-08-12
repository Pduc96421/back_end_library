import { Request, Response } from "express";
import UserLibrary from "../models/user-library.model";
import LibraryDocument from "../models/library-document.model";
import { getPagination } from "../../../helpers/pagination";
import { mapLibraryDetailResponse, mapLibraryToResponse } from "../../../helpers/format-library";

// Get /library
export const getAllLibraryOfUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { page, size, skip } = getPagination(req.query);
    const libraries = await UserLibrary.find({ user_id: userId }).skip(skip).limit(size).populate({
      path: "user_id",
      select: "username avatarUrl phone_number",
    });

    const totalElements = await UserLibrary.countDocuments({ user_id: userId });
    const totalPages = Math.ceil(totalElements / size);

    const content = await Promise.all(libraries.map(mapLibraryToResponse));

    return res.status(200).json({
      code: 200,
      message: "Lấy danh sách thư viện thành công",
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

// Get /library/:libraryId
export const getOneLibraryOfUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { libraryId } = req.params;
    const { page = 1, size = 10 } = req.query;

    const library = await UserLibrary.findOne({ _id: libraryId, user_id: userId }).populate({
      path: "user_id",
      select: "username avatarUrl phone_number",
    });

    if (!library) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy thư viện" });
    }

    const result = await mapLibraryDetailResponse(library, Number(page), Number(size));

    return res.status(200).json({ code: 200, message: "Lấy thư viện thành công", result });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /library/all-library/:userId
export const getAllLibraryOfUserId = async (req: Request, res: Response) => {
  try {
    const { page, size, skip } = getPagination(req.query);
    const { userId } = req.params;
    const libraries = await UserLibrary.find({ user_id: userId }).skip(skip).limit(size).populate({
      path: "user_id",
      select: "username avatarUrl phone_number",
    });

    const totalElements = await UserLibrary.countDocuments({ user_id: userId });
    const totalPages = Math.ceil(totalElements / size);

    const content = await Promise.all(libraries.map(mapLibraryToResponse));

    const result = { content, page, size, totalElements, totalPages };

    return res.status(200).json({ code: 200, message: "Lấy danh sách thư viện thành công", result: result });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /library
export const createLibrary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ code: 400, message: "Thiếu tên thư viện" });
    }
    const library = await UserLibrary.create({ name, description, user_id: userId });

    return res.status(201).json({ code: 201, message: "Tạo thư viện thành công", result: library });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Put /library/:libraryId
export const updateLibrary = async (req: Request, res: Response) => {
  try {
    const { libraryId } = req.params;
    const { name, description } = req.body;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    const library = await UserLibrary.findByIdAndUpdate(libraryId, updateData, { new: true });
    if (!library) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy thư viện" });
    }

    return res.status(200).json({ code: 200, message: "Cập nhật thư viện thành công", result: library });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Delete /library/:libraryId
export const deleteLibrary = async (req: Request, res: Response) => {
  try {
    const { libraryId } = req.params;
    const deleted = await UserLibrary.findByIdAndDelete(libraryId);
    if (!deleted) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy thư viện" });
    }
    await LibraryDocument.deleteMany({ library_id: libraryId });

    return res.status(200).json({ code: 200, message: "Xóa thư viện thành công" });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /library/:libraryId/:documentId/status
export const changeStatusDocument = async (req: Request, res: Response) => {
  try {
    const { libraryId, documentId } = req.params;

    const libraryDocument = await LibraryDocument.findOneAndUpdate(
      {
        library_id: libraryId,
        document_id: documentId,
      },
      { status: "COMPLETED" },
      { new: true, runValidators: true },
    );

    if (!libraryDocument) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu trong thư viện" });
    }

    return res
      .status(200)
      .json({ code: 200, message: "Thay đổi trạng thái tài liệu thành công", result: libraryDocument });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /library/user/:libraryId/:documentId
export const addDocumentToLibrary = async (req: Request, res: Response) => {
  try {
    const { libraryId, documentId } = req.params;
    const { note } = req.body;
    const existed = await LibraryDocument.findOne({ library_id: libraryId, document_id: documentId });
    if (existed) {
      return res.status(409).json({ code: 409, message: "Tài liệu đã có trong thư viện" });
    }
    const libraryDocument = await LibraryDocument.create({ library_id: libraryId, document_id: documentId, note });

    return res
      .status(201)
      .json({ code: 201, message: "Thêm tài liệu vào thư viện thành công", result: libraryDocument });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Delete /library/user/:libraryId/:documentId
export const deleteDocumentToLibrary = async (req: Request, res: Response) => {
  try {
    const { libraryId, documentId } = req.params;
    const deleted = await LibraryDocument.findOneAndDelete({ library_id: libraryId, document_id: documentId });
    if (!deleted) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu trong thư viện" });
    }
    return res.status(200).json({ code: 200, message: "Xóa tài liệu khỏi thư viện thành công" });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};
