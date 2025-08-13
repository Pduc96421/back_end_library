import { Request, Response } from "express";
import Category from "../models/category.model";
import { getPagination } from "../../../helpers/pagination";
import { mapDocumentToResponse } from "../../../helpers/format-document";
import Document from "../models/document.model";
import { formatCategory } from "../../../helpers/format-cateogry";

// Get /categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ status: "ACTIVE" });
    const content = categories.map(formatCategory);
    return res.status(200).json({ code: 200, message: "Lấy danh sách danh mục thành công", result: content });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post categories/
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ code: 400, message: "Thiếu tên danh mục" });
    }
    const existed = await Category.findOne({ name });
    if (existed) {
      return res.status(409).json({ code: 409, message: "Danh mục đã tồn tại" });
    }
    const category = await Category.create({ name, description });
    return res.status(201).json({ code: 201, message: "Tạo danh mục thành công", result: category });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get categories/:categoryId/detail
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findOne({ _id: categoryId, status: "ACTIVE" });
    if (!category) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy danh mục" });
    }

    const content = formatCategory(category);
    return res.status(200).json({ code: 200, message: "Lấy chi tiết danh mục thành công", result: content });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Put categories/:categoryId
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    const category = await Category.findByIdAndUpdate(categoryId, updateData, { new: true });
    if (!category) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy danh mục" });
    }
    return res.status(200).json({ code: 200, message: "Cập nhật danh mục thành công", result: category });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Delete categories/:categoryId
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const deleted = await Category.findByIdAndDelete(categoryId);
    if (!deleted) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy danh mục" });
    }
    return res.status(200).json({ code: 200, message: "Xóa danh mục thành công" });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get categories/:categoryId/documents
export const getCategoryDocuments = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { page, size, skip } = getPagination(req.query);

    const category = await Category.findOne({ _id: categoryId, status: "ACTIVE" });
    if (!category) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy danh mục" });
    }

    const findDocuments = { category_id: categoryId, status: "APPROVED", is_public: true };

    const documents = await Document.find(findDocuments).skip(skip).limit(size);

    const totalElements = await Document.countDocuments(findDocuments);
    const totalPages = Math.ceil(totalElements / size);

    const content = await Promise.all(documents.map(mapDocumentToResponse));

    return res.status(200).json({
      code: 200,
      message: "Lấy tài liệu theo danh mục thành công",
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

// Get categories/search
export const searchCategories = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    const categories = await Category.find({
      status: "ACTIVE",
      $or: [
        {
          name: { $regex: keyword, $options: "i" },
        },
        {
          description: { $regex: keyword, $options: "i" },
        },
      ],
    });

    const content = categories.map(formatCategory);

    return res.status(200).json({
      code: 200,
      message: "Tìm kiếm danh mục thành công",
      result: content,
    });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};
