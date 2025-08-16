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
exports.deleteRole = exports.createRole = exports.getAllRoles = void 0;
const role_model_1 = __importDefault(require("../models/role.model"));
const getAllRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield role_model_1.default.find();
        return res.status(200).json({ code: 200, message: "Lấy danh sách vai trò thành công", result: roles });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getAllRoles = getAllRoles;
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ code: 400, message: "Thiếu tên vai trò" });
        }
        const existed = yield role_model_1.default.findOne({ name });
        if (existed) {
            return res.status(409).json({ code: 409, message: "Vai trò đã tồn tại" });
        }
        const role = yield role_model_1.default.create({ name, description });
        return res.status(201).json({ code: 201, message: "Tạo vai trò thành công", result: role });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.createRole = createRole;
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role } = req.params;
        const deleted = yield role_model_1.default.findOneAndDelete({ name: role });
        if (!deleted) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy vai trò" });
        }
        return res.status(200).json({ code: 200, message: "Xóa vai trò thành công" });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.deleteRole = deleteRole;
