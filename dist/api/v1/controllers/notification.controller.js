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
exports.getNotifications = void 0;
const document_model_1 = __importDefault(require("../models/document.model"));
const pagination_1 = require("../../../helpers/pagination");
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const documents = yield document_model_1.default.aggregate([
            {
                $addFields: {
                    pendingFirst: {
                        $cond: [{ $eq: ["$status", "PENDING"] }, 0, 1],
                    },
                },
            },
            {
                $sort: {
                    pendingFirst: 1,
                    createdAt: -1,
                },
            },
            { $skip: skip },
            { $limit: size },
            {
                $lookup: {
                    from: "users",
                    localField: "created_by",
                    foreignField: "_id",
                    as: "created_by",
                },
            },
            { $unwind: "$created_by" },
            {
                $project: {
                    pendingFirst: 0,
                },
            },
        ]);
        const totalElements = yield document_model_1.default.countDocuments({});
        const totalPages = Math.ceil(totalElements / size);
        const content = documents.map((doc) => ({
            id: doc._id,
            title: getNotificationTitle(doc.status),
            description: getNotificationDescription(doc),
            createdAt: doc.createdAt,
            documentId: doc._id,
            read: doc.status === "APPROVED" || doc.status === "REJECTED",
        }));
        return res.status(200).json({
            code: 200,
            message: "Lấy thông báo thành công",
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
exports.getNotifications = getNotifications;
function getNotificationTitle(status) {
    switch (status) {
        case "PENDING":
            return "Tài liệu mới cần duyệt";
        case "APPROVED":
            return "Tài liệu đã được duyệt";
        case "REJECTED":
            return "Tài liệu đã bị từ chối";
        default:
            return "Thông báo tài liệu";
    }
}
function getNotificationDescription(doc) {
    var _a;
    const username = ((_a = doc.created_by) === null || _a === void 0 ? void 0 : _a.username) || "Người dùng";
    switch (doc.status) {
        case "PENDING":
            return `Tài liệu "${doc.title}" được tải lên bởi ${username} đang chờ duyệt`;
        case "APPROVED":
            return `Tài liệu "${doc.title}" được tải lên bởi ${username} đã được duyệt`;
        case "REJECTED":
            return `Tài liệu "${doc.title}" được tải lên bởi ${username} đã bị từ chối`;
        default:
            return `Tài liệu "${doc.title}" được tải lên bởi ${username}`;
    }
}
