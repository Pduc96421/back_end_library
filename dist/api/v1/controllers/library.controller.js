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
exports.deleteDocumentToLibrary = exports.addDocumentToLibrary = exports.changeStatusDocument = exports.deleteLibrary = exports.updateLibrary = exports.createLibrary = exports.getAllLibraryOfUserId = exports.getOneLibraryOfUser = exports.getAllLibraryOfUser = void 0;
const user_library_model_1 = __importDefault(require("../models/user-library.model"));
const library_document_model_1 = __importDefault(require("../models/library-document.model"));
const pagination_1 = require("../../../helpers/pagination");
const format_library_1 = require("../../../helpers/format-library");
const getAllLibraryOfUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const libraries = yield user_library_model_1.default.find({ user_id: userId }).skip(skip).limit(size).populate({
            path: "user_id",
            select: "username avatarUrl phone_number",
        });
        const totalElements = yield user_library_model_1.default.countDocuments({ user_id: userId });
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(libraries.map(format_library_1.mapLibraryToResponse));
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
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getAllLibraryOfUser = getAllLibraryOfUser;
const getOneLibraryOfUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { libraryId } = req.params;
        const { page = 1, size = 10 } = req.query;
        const library = yield user_library_model_1.default.findOne({ _id: libraryId, user_id: userId }).populate({
            path: "user_id",
            select: "username avatarUrl phone_number",
        });
        if (!library) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy thư viện" });
        }
        const result = yield (0, format_library_1.mapLibraryDetailResponse)(library, Number(page), Number(size));
        return res.status(200).json({ code: 200, message: "Lấy thư viện thành công", result });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getOneLibraryOfUser = getOneLibraryOfUser;
const getAllLibraryOfUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const { userId } = req.params;
        const libraries = yield user_library_model_1.default.find({ user_id: userId }).skip(skip).limit(size).populate({
            path: "user_id",
            select: "username avatarUrl phone_number",
        });
        const totalElements = yield user_library_model_1.default.countDocuments({ user_id: userId });
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(libraries.map(format_library_1.mapLibraryToResponse));
        const result = { content, page, size, totalElements, totalPages };
        return res.status(200).json({ code: 200, message: "Lấy danh sách thư viện thành công", result: result });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getAllLibraryOfUserId = getAllLibraryOfUserId;
const createLibrary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ code: 400, message: "Thiếu tên thư viện" });
        }
        const library = yield user_library_model_1.default.create({ name, description, user_id: userId });
        return res.status(201).json({ code: 201, message: "Tạo thư viện thành công", result: library });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.createLibrary = createLibrary;
const updateLibrary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { libraryId } = req.params;
        const { name, description } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        const library = yield user_library_model_1.default.findByIdAndUpdate(libraryId, updateData, { new: true });
        if (!library) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy thư viện" });
        }
        return res.status(200).json({ code: 200, message: "Cập nhật thư viện thành công", result: library });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.updateLibrary = updateLibrary;
const deleteLibrary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { libraryId } = req.params;
        const deleted = yield user_library_model_1.default.findByIdAndDelete(libraryId);
        if (!deleted) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy thư viện" });
        }
        yield library_document_model_1.default.deleteMany({ library_id: libraryId });
        return res.status(200).json({ code: 200, message: "Xóa thư viện thành công" });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.deleteLibrary = deleteLibrary;
const changeStatusDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { libraryId, documentId } = req.params;
        const libraryDocument = yield library_document_model_1.default.findOneAndUpdate({
            library_id: libraryId,
            document_id: documentId,
        }, { status: "COMPLETED" }, { new: true, runValidators: true });
        if (!libraryDocument) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu trong thư viện" });
        }
        return res
            .status(200)
            .json({ code: 200, message: "Thay đổi trạng thái tài liệu thành công", result: libraryDocument });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.changeStatusDocument = changeStatusDocument;
const addDocumentToLibrary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { libraryId, documentId } = req.params;
        const { note } = req.body;
        const existed = yield library_document_model_1.default.findOne({ library_id: libraryId, document_id: documentId });
        if (existed) {
            return res.status(409).json({ code: 409, message: "Tài liệu đã có trong thư viện" });
        }
        const libraryDocument = yield library_document_model_1.default.create({ library_id: libraryId, document_id: documentId, note });
        return res
            .status(201)
            .json({ code: 201, message: "Thêm tài liệu vào thư viện thành công", result: libraryDocument });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.addDocumentToLibrary = addDocumentToLibrary;
const deleteDocumentToLibrary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { libraryId, documentId } = req.params;
        const deleted = yield library_document_model_1.default.findOneAndDelete({ library_id: libraryId, document_id: documentId });
        if (!deleted) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu trong thư viện" });
        }
        return res.status(200).json({ code: 200, message: "Xóa tài liệu khỏi thư viện thành công" });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.deleteDocumentToLibrary = deleteDocumentToLibrary;
