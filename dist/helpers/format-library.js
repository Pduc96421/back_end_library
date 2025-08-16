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
exports.mapLibraryToResponse = mapLibraryToResponse;
exports.mapLibraryDetailResponse = mapLibraryDetailResponse;
const library_document_model_1 = __importDefault(require("../api/v1/models/library-document.model"));
const format_document_1 = require("./format-document");
function mapLibraryToResponse(library) {
    return __awaiter(this, void 0, void 0, function* () {
        const documentCount = yield library_document_model_1.default.countDocuments({
            library_id: library._id,
        });
        return {
            id: library._id,
            user: {
                id: library.user_id._id,
                userName: library.user_id.username || "",
                avatarUser: library.user_id.avatarUrl || "",
                phoneNumber: library.user_id.phone_number || "",
            },
            name: library.name,
            description: library.description,
            documentCount,
        };
    });
}
function mapLibraryDetailResponse(library, page, size) {
    return __awaiter(this, void 0, void 0, function* () {
        const basicInfo = yield mapLibraryToResponse(library);
        const skip = (page - 1) * size;
        const libraryDocuments = yield library_document_model_1.default.find({ library_id: library._id })
            .skip(skip)
            .limit(size)
            .populate("document_id");
        const totalElements = yield library_document_model_1.default.countDocuments({ library_id: library._id });
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(libraryDocuments.map((libDoc) => __awaiter(this, void 0, void 0, function* () {
            return ({
                id: libDoc._id,
                document: yield (0, format_document_1.mapDocumentToResponse)(libDoc.document_id),
                status: libDoc.status || "UNREAD",
                note: libDoc.note || "",
                progress: libDoc.progress || 0,
            });
        })));
        return Object.assign(Object.assign({}, basicInfo), { document: {
                content,
                page,
                size,
                totalElements,
                totalPages,
            } });
    });
}
