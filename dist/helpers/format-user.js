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
exports.mapUserFullResponse = mapUserFullResponse;
const document_model_1 = __importDefault(require("../api/v1/models/document.model"));
const format_document_1 = require("../helpers/format-document");
const document_download_model_1 = __importDefault(require("../api/v1/models/document-download.model"));
const pagination_1 = require("./pagination");
function mapUserFullResponse(user_1) {
    return __awaiter(this, arguments, void 0, function* (user, docPage = 1, docSize = 10) {
        const { page, size, skip } = (0, pagination_1.getPagination)({ page: docPage, size: docSize });
        const docs = yield document_model_1.default.find({ created_by: user._id }).skip(skip).limit(size);
        const totalElements = yield document_model_1.default.countDocuments({ created_by: user._id });
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(docs.map(format_document_1.mapDocumentToResponse));
        const documentDownload = yield document_download_model_1.default.countDocuments({ user_id: user._id });
        return {
            id: user._id,
            fullName: user.full_name,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            status: user.status,
            dob: user.dob,
            emailVerified: user.email_verified,
            phoneNumber: user.phone_number,
            documents: {
                content,
                page,
                size,
                totalElements,
                totalPages,
            },
            documentDownload,
        };
    });
}
