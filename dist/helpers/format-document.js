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
exports.mapDocumentToResponse = mapDocumentToResponse;
exports.getAccessibleDocumentIds = getAccessibleDocumentIds;
exports.formatSearchDocument = formatSearchDocument;
const category_model_1 = __importDefault(require("../api/v1/models/category.model"));
const document_view_model_1 = __importDefault(require("../api/v1/models/document-view.model"));
const document_like_model_1 = __importDefault(require("../api/v1/models/document-like.model"));
const document_download_model_1 = __importDefault(require("../api/v1/models/document-download.model"));
const document_rating_model_1 = __importDefault(require("../api/v1/models/document-rating.model"));
const document_tag_model_1 = __importDefault(require("../api/v1/models/document-tag.model"));
const document_access_model_1 = __importDefault(require("../api/v1/models/document-access.model"));
function mapDocumentToResponse(doc) {
    return __awaiter(this, void 0, void 0, function* () {
        const views = yield document_view_model_1.default.countDocuments({ document_id: doc._id });
        const likes = yield document_like_model_1.default.countDocuments({ document_id: doc._id });
        const downloads = yield document_download_model_1.default.countDocuments({ document_id: doc._id });
        const ratings = yield document_rating_model_1.default.find({ document_id: doc._id });
        const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length : 0;
        const tags = yield document_tag_model_1.default.find({ document_id: doc._id }).populate("tag_id", "name");
        const tagList = tags.map((tag) => ({
            id: tag.tag_id._id,
            name: tag.tag_id.name,
        }));
        let category = null;
        if (doc.category_id) {
            const cat = yield category_model_1.default.findById(doc.category_id);
            if (cat) {
                category = {
                    id: cat._id,
                    name: cat.name,
                    status: cat.status || "",
                    description: cat.description || "",
                };
            }
        }
        return {
            id: doc._id,
            title: doc.title,
            category,
            views,
            like: likes,
            downloads,
            averageRating,
            status: doc.status,
            tags: tagList,
            previewUrls: doc.preview_urls || [],
            description: doc.description,
            fileUrl: doc.file_url,
            fileType: doc.file_type,
            fileSize: doc.file_size,
            isPublic: doc.is_public,
        };
    });
}
function getAccessibleDocumentIds(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessRecords = (yield document_access_model_1.default.find({ user_id: userId }));
        return accessRecords.map((record) => record.document_id.toString());
    });
}
function formatSearchDocument(doc) {
    return __awaiter(this, void 0, void 0, function* () {
        const tags = yield document_tag_model_1.default.find({ document_id: doc._id }).populate("tag_id", "name");
        const tagList = tags.map((tag) => ({
            id: tag.tag_id._id,
            name: tag.tag_id.name,
        }));
        return {
            id: doc._id,
            title: doc.title,
            description: doc.description,
            fileUrl: doc.file_url,
            previewUrls: doc.preview_urls || [],
            tags: tagList,
            status: doc.status,
        };
    });
}
