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
exports.getAllTags = exports.uploadDocument = exports.rateDocument = exports.downloadDocument = exports.changeAccess = exports.unlikeDocument = exports.likeDocument = exports.rejectDocument = exports.approveDocument = exports.deleteDocument = exports.updateDocument = exports.getDocument = exports.getSharedDocuments = exports.getDocumentOfUser = exports.getPendingDocuments = exports.searchDocuments = exports.getTopDocuments = exports.getAllDocuments = void 0;
const document_model_1 = __importDefault(require("../models/document.model"));
const tag_model_1 = __importDefault(require("../models/tag.model"));
const format_document_1 = require("../../../helpers/format-document");
const pagination_1 = require("../../../helpers/pagination");
const document_tag_model_1 = __importDefault(require("../models/document-tag.model"));
const document_view_model_1 = __importDefault(require("../models/document-view.model"));
const document_like_model_1 = __importDefault(require("../models/document-like.model"));
const document_download_model_1 = __importDefault(require("../models/document-download.model"));
const document_access_model_1 = __importDefault(require("../models/document-access.model"));
const document_rating_model_1 = __importDefault(require("../models/document-rating.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
let find = { status: "APPROVED", is_public: true };
const getAllDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myUser = req.local.user;
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        let documents = [];
        let totalElements = 0;
        if ((myUser === null || myUser === void 0 ? void 0 : myUser.role) === "ADMIN") {
            documents = yield document_model_1.default.find().skip(skip).limit(size);
            totalElements = yield document_model_1.default.countDocuments();
        }
        else {
            documents = yield document_model_1.default.find(find).skip(skip).limit(size);
            totalElements = yield document_model_1.default.countDocuments(find);
        }
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(documents.map(format_document_1.mapDocumentToResponse));
        const result = { content, page, size, totalElements, totalPages };
        return res.status(200).json({ code: 200, message: "Lấy danh sách tài liệu thành công", result });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getAllDocuments = getAllDocuments;
const getTopDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const documents = yield document_model_1.default.find(find).sort({ views: -1 }).limit(10);
        const content = yield Promise.all(documents.map(format_document_1.mapDocumentToResponse));
        return res.status(200).json({ code: 200, message: "Lấy top tài liệu thành công", result: content });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getTopDocuments = getTopDocuments;
const searchDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const { keyword, tag } = req.query;
        let query = { status: "APPROVED", is_public: true };
        if (keyword) {
            query = Object.assign(Object.assign({}, query), { $or: [{ title: { $regex: keyword, $options: "i" } }, { description: { $regex: keyword, $options: "i" } }] });
        }
        if (tag) {
            const foundTags = yield tag_model_1.default.find({ name: { $regex: tag, $options: "i" } });
            if (foundTags.length > 0) {
                const tagIds = foundTags.map((t) => t._id);
                const docTags = yield document_tag_model_1.default.find({ tag_id: { $in: tagIds } }).populate("document_id");
                if (docTags.length > 0) {
                    const documentIds = docTags.map((dt) => dt.document_id);
                    query._id = { $in: documentIds };
                }
                else {
                    return res.status(200).json({
                        code: 200,
                        message: "Tìm kiếm tài liệu thành công",
                        result: { content: [], page, size, totalElements: 0, totalPages: 0 },
                    });
                }
            }
        }
        const [documents, totalElements] = yield Promise.all([
            document_model_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(size),
            document_model_1.default.countDocuments(query),
        ]);
        const content = yield Promise.all(documents.map(format_document_1.formatSearchDocument));
        return res.status(200).json({
            code: 200,
            message: "Tìm kiếm tài liệu thành công",
            result: { content, page, size, totalElements, totalPages: Math.ceil(totalElements / size) },
        });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.searchDocuments = searchDocuments;
const getPendingDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const documents = yield document_model_1.default.find({ status: "PENDING" }).skip(skip).limit(size);
        const totalElements = yield document_model_1.default.countDocuments();
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(documents.map(format_document_1.mapDocumentToResponse));
        const result = { content, page, size, totalElements, totalPages };
        return res.status(200).json({ code: 200, message: "Lấy tài liệu chờ duyệt thành công", result: result });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getPendingDocuments = getPendingDocuments;
const getDocumentOfUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const documents = yield document_model_1.default.find({ created_by: userId }).skip(skip).limit(size);
        const totalElements = yield document_model_1.default.countDocuments();
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(documents.map(format_document_1.mapDocumentToResponse));
        const result = { content, page, size, totalElements, totalPages };
        return res.status(200).json({ code: 200, message: "Lấy tài liệu của người dùng thành công", result: result });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getDocumentOfUser = getDocumentOfUser;
const getSharedDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json({ code: 200, message: "Lấy tài liệu chia sẻ thành công", result: [] });
});
exports.getSharedDocuments = getSharedDocuments;
const getDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { documentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const document = yield document_model_1.default.findOne({
            _id: documentId,
            $or: [find, { created_by: userId }, { _id: { $in: yield (0, format_document_1.getAccessibleDocumentIds)(userId) } }],
        });
        if (!document) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu hoặc bạn không có quyền truy cập" });
        }
        const isLiked = userId ? yield document_like_model_1.default.exists({ document_id: documentId, user_id: userId }) : false;
        yield document_view_model_1.default.create({ document_id: documentId, user_id: userId });
        const content = yield (0, format_document_1.mapDocumentToResponse)(document);
        return res
            .status(200)
            .json({ code: 200, message: "Lấy chi tiết tài liệu thành công", result: Object.assign(Object.assign({}, content), { liked: !!isLiked }) });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getDocument = getDocument;
const updateDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { documentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const updateData = req.body;
        const document = yield document_model_1.default.findByIdAndUpdate(documentId, { updateData, modified_by: userId }, { new: true, runValidators: true });
        if (!document) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
        }
        return res.status(200).json({ code: 200, message: "Cập nhật tài liệu thành công", result: document });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.updateDocument = updateDocument;
const deleteDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId } = req.params;
        const deleted = yield document_model_1.default.findByIdAndDelete(documentId);
        if (!deleted) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
        }
        return res.status(200).json({ code: 200, message: "Xóa tài liệu thành công" });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.deleteDocument = deleteDocument;
const approveDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId } = req.params;
        const document = yield document_model_1.default.findByIdAndUpdate(documentId, { status: "APPROVED" }, { new: true });
        if (!document) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
        }
        const content = yield (0, format_document_1.mapDocumentToResponse)(document);
        return res.status(200).json({ code: 200, message: "Duyệt tài liệu thành công", result: content });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.approveDocument = approveDocument;
const rejectDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId } = req.params;
        const document = yield document_model_1.default.findByIdAndUpdate(documentId, { status: "REJECTED" }, { new: true });
        if (!document) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
        }
        const content = yield (0, format_document_1.mapDocumentToResponse)(document);
        return res.status(200).json({ code: 200, message: "Từ chối tài liệu thành công", result: content });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.rejectDocument = rejectDocument;
const likeDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { documentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const document = yield document_model_1.default.findById(documentId);
        if (!document) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
        }
        const existingLike = yield document_like_model_1.default.findOne({ document_id: documentId, user_id: userId });
        if (existingLike) {
            return res.status(400).json({ code: 400, message: "Bạn đã like tài liệu này rồi" });
        }
        yield document_like_model_1.default.create({ document_id: documentId, user_id: userId });
        const content = yield (0, format_document_1.mapDocumentToResponse)(document);
        return res.status(200).json({ code: 200, message: "Like tài liệu thành công", result: content });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.likeDocument = likeDocument;
const unlikeDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { documentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const deleted = yield document_like_model_1.default.findOneAndDelete({ document_id: documentId, user_id: userId });
        if (!deleted) {
            return res.status(404).json({ code: 404, message: "Bạn chưa like tài liệu này" });
        }
        return res.status(200).json({ code: 200, message: "Bỏ like tài liệu thành công" });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.unlikeDocument = unlikeDocument;
const changeAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { documentId } = req.params;
        const { email, accessType } = req.body;
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const document = yield document_model_1.default.findOne({ _id: documentId, created_by: currentUserId, is_public: false });
        const targetUser = yield user_model_1.default.findOne({ email, status: "ACTIVE" });
        if (!targetUser) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng với email này" });
        }
        if (!document) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu hoặc bạn không có quyền thay đổi" });
        }
        const access = yield document_access_model_1.default.findOneAndUpdate({ document_id: documentId, user_id: targetUser._id }, { document_id: documentId, user_id: targetUser._id, access_type: accessType }, { upsert: true, new: true, runValidators: true });
        return res.status(200).json({ code: 200, message: "Thay đổi quyền truy cập thành công", result: access });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.changeAccess = changeAccess;
const downloadDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { documentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const document = yield document_model_1.default.findById(documentId);
        if (!document) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu" });
        }
        yield document_download_model_1.default.create({ document_id: documentId, user_id: userId });
        return res
            .status(200)
            .json({ code: 200, message: "Tải tài liệu thành công", result: { downloadUrl: document.file_url } });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.downloadDocument = downloadDocument;
const rateDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { documentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { rating, review } = req.body;
        const document = yield document_model_1.default.findOne({ _id: documentId, status: "APPROVED" });
        if (!document) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài liệu hoặc tài liệu chưa được duyệt" });
        }
        const documentRating = yield document_rating_model_1.default.findOneAndUpdate({ document_id: documentId, user_id: userId }, { rating, review: review || "", document_id: documentId, user_id: userId }, { upsert: true, new: true, runValidators: true });
        const content = yield (0, format_document_1.mapDocumentToResponse)(document);
        return res.status(200).json({
            code: 200,
            message: "Đánh giá tài liệu thành công",
            result: { rating: documentRating, document: content },
        });
    }
    catch (error) {
        return res.status(500).json({
            code: 500,
            message: "Lỗi máy chủ",
            error: error.message,
        });
    }
});
exports.rateDocument = rateDocument;
const uploadDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const document = yield document_model_1.default.create({
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
            tagList = yield Promise.all(tags.map((tagName) => __awaiter(void 0, void 0, void 0, function* () {
                let tag = yield tag_model_1.default.findOne({ name: tagName });
                if (!tag) {
                    tag = yield tag_model_1.default.create({ name: tagName });
                }
                yield document_tag_model_1.default.create({ document_id: document._id, tag_id: tag._id });
                return { id: tag._id, name: tag.name };
            })));
        }
        return res.status(201).json({
            code: 201,
            message: "Tải lên tài liệu thành công",
            result: Object.assign(Object.assign({}, document.toObject()), { tags: tagList, preview_urls }),
        });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.uploadDocument = uploadDocument;
const getAllTags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tags = yield tag_model_1.default.find();
        const content = tags.map((tag) => ({ id: tag._id, name: tag.name }));
        return res.status(200).json({
            code: 200,
            message: "Lấy tất cả thẻ thành công",
            result: content,
        });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getAllTags = getAllTags;
