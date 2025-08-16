"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCategories = exports.getCategoryDocuments = exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.createCategory = exports.getAllCategories = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const pagination_1 = require("../../../helpers/pagination");
const format_document_1 = require("../../../helpers/format-document");
const document_model_1 = __importDefault(require("../models/document.model"));
const format_cateogry_1 = require("../../../helpers/format-cateogry");
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_model_1.default.find({ status: "ACTIVE" });
        const content = categories.map(format_cateogry_1.formatCategory);
        return res.status(200).json({ code: 200, message: "Lấy danh sách danh mục thành công", result: content });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getAllCategories = getAllCategories;
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ code: 400, message: "Thiếu tên danh mục" });
        }
        const existed = yield category_model_1.default.findOne({ name });
        if (existed) {
            return res.status(409).json({ code: 409, message: "Danh mục đã tồn tại" });
        }
        const category = yield category_model_1.default.create({ name, description });
        return res.status(201).json({ code: 201, message: "Tạo danh mục thành công", result: category });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.createCategory = createCategory;
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const category = yield category_model_1.default.findOne({ _id: categoryId, status: "ACTIVE" });
        if (!category) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy danh mục" });
        }
        const content = (0, format_cateogry_1.formatCategory)(category);
        return res.status(200).json({ code: 200, message: "Lấy chi tiết danh mục thành công", result: content });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getCategoryById = getCategoryById;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const { name, description } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        const category = yield category_model_1.default.findByIdAndUpdate(categoryId, updateData, { new: true });
        if (!category) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy danh mục" });
        }
        return res.status(200).json({ code: 200, message: "Cập nhật danh mục thành công", result: category });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const deleted = yield category_model_1.default.findByIdAndDelete(categoryId);
        if (!deleted) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy danh mục" });
        }
        return res.status(200).json({ code: 200, message: "Xóa danh mục thành công" });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.deleteCategory = deleteCategory;
const getCategoryDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const category = yield category_model_1.default.findOne({ _id: categoryId, status: "ACTIVE" });
        if (!category) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy danh mục" });
        }
        const findDocuments = { category_id: categoryId, status: "APPROVED", is_public: true };
        const documents = yield document_model_1.default.find(findDocuments).skip(skip).limit(size);
        const totalElements = yield document_model_1.default.countDocuments(findDocuments);
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(documents.map(format_document_1.mapDocumentToResponse));
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
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getCategoryDocuments = getCategoryDocuments;
const searchCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { keyword } = req.query;
        const categories = yield category_model_1.default.find({
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
        const content = categories.map(format_cateogry_1.formatCategory);
        return res.status(200).json({
            code: 200,
            message: "Tìm kiếm danh mục thành công",
            result: content,
        });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.searchCategories = searchCategories;
