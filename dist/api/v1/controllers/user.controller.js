"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.createUser = exports.verifyForgotPassword = exports.forgotPassword = exports.openAccount = exports.register = exports.changePassword = exports.deleteUser = exports.updateUser = exports.getUser = exports.confirmAccount = exports.sentConfirmAccount = exports.getLibrary = exports.getMyInfo = exports.searchUsers = exports.getUsers = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendMail_1 = require("../../../helpers/sendMail");
const generateHelper = __importStar(require("../../../helpers/generate"));
const sendMailHelper = __importStar(require("../../../helpers/sendMail"));
const forgot_password_model_1 = __importDefault(require("../models/forgot-password.model"));
const pagination_1 = require("../../../helpers/pagination");
const format_user_1 = require("../../../helpers/format-user");
const user_library_model_1 = __importDefault(require("../models/user-library.model"));
const library_document_model_1 = __importDefault(require("../models/library-document.model"));
const JWT_SECRET = process.env.JWT_SECRET;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const docPage = parseInt(req.query.docPage || "1");
        const docSize = parseInt(req.query.docSize || "10");
        const users = yield user_model_1.default.find({ deleted: false }).skip(skip).limit(size);
        const totalElements = yield user_model_1.default.countDocuments({ deleted: false });
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(users.map((user) => (0, format_user_1.mapUserFullResponse)(user, docPage, docSize)));
        const result = { content, page, size, totalElements, totalPages };
        return res.status(200).json({ code: 200, message: "Lấy danh sách người dùng thành công", result });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getUsers = getUsers;
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { keyword } = req.query;
        const search = {
            deleted: false,
            $or: [
                { username: { $regex: keyword, $options: "i" } },
                { full_name: { $regex: keyword, $options: "i" } },
                { email: { $regex: keyword, $options: "i" } },
            ],
        };
        const { page, size, skip } = (0, pagination_1.getPagination)(req.query);
        const docPage = parseInt(req.query.docPage || "1");
        const docSize = parseInt(req.query.docSize || "10");
        const users = yield user_model_1.default.find(search).skip(skip).limit(size);
        const totalElements = yield user_model_1.default.countDocuments(search);
        const totalPages = Math.ceil(totalElements / size);
        const content = yield Promise.all(users.map((user) => (0, format_user_1.mapUserFullResponse)(user, docPage, docSize)));
        const result = { content, page, size, totalElements, totalPages };
        return res.status(200).json({ code: 200, message: "Tìm kiếm thành công", result });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.searchUsers = searchUsers;
const getMyInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const docPage = parseInt(req.query.docPage || "1");
        const docSize = parseInt(req.query.docSize || "10");
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
        }
        const content = yield (0, format_user_1.mapUserFullResponse)(user, docPage, docSize);
        return res.status(200).json({ code: 200, message: "Lấy thông tin cá nhân thành công", result: content });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getMyInfo = getMyInfo;
const getLibrary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const libraries = yield user_library_model_1.default.find({ user_id: userId });
        const result = yield Promise.all(libraries.map((library) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_model_1.default.findById(userId).select("username avatar phone_number");
            const documentCount = yield library_document_model_1.default.countDocuments({ library_id: library._id });
            return {
                id: library._id,
                user: {
                    id: userId,
                    userName: (user === null || user === void 0 ? void 0 : user.username) || "",
                    avatarUser: (user === null || user === void 0 ? void 0 : user.avatarUrl) || "",
                    phoneNumber: (user === null || user === void 0 ? void 0 : user.phone_number) || "",
                },
                name: library.name,
                description: library.description,
                documentCount,
            };
        })));
        return res.status(200).json({ code: 200, message: "Lấy thư viện cá nhân thành công", result });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getLibrary = getLibrary;
const sentConfirmAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_model_1.default.findOne({ email: email, deleted: false });
        if (!user) {
            return res.status(404).json({ code: 404, message: "User not found" });
        }
        if (user.email_verified) {
            return res.status(400).json({ code: 400, message: "Email đã được xác thực" });
        }
        const otp = generateHelper.generateRandomString(10);
        const objectConfirmAccount = {
            email: email,
            otp: otp,
            action: "confirm-account",
            expireAt: Date.now(),
        };
        const confirmAccount = new forgot_password_model_1.default(objectConfirmAccount);
        yield confirmAccount.save();
        const subject = "Mã OTP xác thực tài khoản.";
        const htmlSendMail = `Mã OTP xác thực của bạn là <b style="color: green;">${otp}</b>. Mã OTP có hiệu lực trong 5 phút. Vui lòng không cung cấp mã OTP cho người khác.`;
        sendMailHelper.sendEmail(email, subject, htmlSendMail);
        res.status(200).json({
            code: 200,
            message: "OTP confirm account sent to email successfully",
        });
    }
    catch (error) {
        res.status(500).send({ code: 500, error: error.message });
    }
});
exports.sentConfirmAccount = sentConfirmAccount;
const confirmAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otpConfirm } = req.body;
        const forgot = yield forgot_password_model_1.default.findOne({
            email: email,
            otp: otpConfirm,
            action: "confirm-account",
        }).sort({ createdAt: -1 });
        if (!forgot) {
            return res.status(404).json({ code: 404, message: "Mã xác thực không đúng hoặc đã hết hạn" });
        }
        const user = yield user_model_1.default.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy tài khoản để xác nhận" });
        }
        user.email_verified = true;
        yield user.save();
        yield forgot_password_model_1.default.deleteOne({ _id: forgot._id });
        return res.status(200).json({ code: 200, message: "Xác nhận tài khoản thành công" });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.confirmAccount = confirmAccount;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const docPage = parseInt(req.query.docPage || "1");
        const docSize = parseInt(req.query.docSize || "10");
        const { userId } = req.params;
        const user = yield user_model_1.default.findById({ userId, deleted: false });
        if (!user) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
        }
        const content = yield (0, format_user_1.mapUserFullResponse)(user, docPage, docSize);
        return res.status(200).json({ code: 200, message: "Lấy thông tin người dùng thành công", result: content });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getUser = getUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        const myUserId = req.user.id;
        if (req.user.role !== "admin") {
            if (userId !== myUserId) {
                return res.status(403).json({ code: 403, message: "Bạn không có quyền để update user này" });
            }
        }
        yield user_model_1.default.updateOne({ _id: userId, deleted: false }, { $set: updateData });
        const updatedUser = yield user_model_1.default.findById(userId);
        return res.status(200).json({ code: 200, message: "Cập nhật thông tin thành công", result: updatedUser });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield user_model_1.default.findByIdAndUpdate(userId, { deleted: true, deletedAt: new Date() });
        if (!user) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
        }
        return res.status(200).json({ code: 200, message: "Xóa người dùng thành công", result: userId });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.deleteUser = deleteUser;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ code: 400, message: "Thiếu thông tin đổi mật khẩu" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(422).json({ code: 422, message: "Mật khẩu mới và xác nhận không khớp" });
        }
        const user = yield user_model_1.default.findById(userId).select("+password");
        if (!user) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
        }
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ code: 401, message: "Mật khẩu hiện tại không đúng" });
        }
        user.password = yield bcryptjs_1.default.hash(newPassword, 10);
        yield user.save();
        return res.status(200).json({ code: 200, message: "Đổi mật khẩu thành công", result: "OK" });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.changePassword = changePassword;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, fullName, dob } = req.body;
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({ code: 400, message: "Thiếu thông tin đăng ký" });
        }
        const existedUser = yield user_model_1.default.findOne({ $or: [{ username }, { email }] });
        if (existedUser) {
            return res.status(409).json({ code: 409, message: "Tên đăng nhập hoặc email đã tồn tại" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield user_model_1.default.create({
            username,
            email,
            password: hashedPassword,
            full_name: fullName,
            dob,
        });
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            role: user.role,
            avatarUrl: user.avatarUrl,
            username: user.username,
        }, JWT_SECRET);
        user.token = token;
        yield user.save();
        return res.status(201).json({ code: 201, message: "Đăng ký tài khoản thành công", result: user });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.register = register;
const openAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield user_model_1.default.findByIdAndUpdate(userId, { status: "ACTIVE" }, { new: true });
        if (!user) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
        }
        return res.status(200).json({ code: 200, message: "Mở khóa tài khoản thành công", result: user });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.openAccount = openAccount;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ code: 400, message: "Thiếu email" });
        }
        const user = yield user_model_1.default.findOne({ email, deleted: false });
        if (!user) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng với email này" });
        }
        const otp = generateHelper.generateRandomNumber(6);
        yield forgot_password_model_1.default.create({
            email,
            otp,
            action: "reset-password",
            expireAt: new Date(Date.now() + 5 * 60 * 1000),
        });
        const subject = "Yêu cầu đặt lại mật khẩu";
        const html = `Mã OTP xác thực của bạn là <b style="color: green;">${otp}</b>. Mã OTP có hiệu lực trong 5 phút. Vui lòng không cung cấp mã OTP cho người khác.`;
        (0, sendMail_1.sendEmail)(email, subject, html);
        return res.status(200).json({ code: 200, message: "Đã gửi mã xác thực đặt lại mật khẩu về email", result: "OK" });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.forgotPassword = forgotPassword;
const verifyForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ code: 400, message: "Vui lòng cung cấp email và mã OTP" });
        }
        const forgotPassword = yield forgot_password_model_1.default.findOne({
            email,
            otp,
            action: "reset-password",
            expireAt: { $gt: new Date() },
        });
        if (!forgotPassword) {
            return res.status(400).json({ code: 400, message: "Mã OTP không đúng hoặc đã hết hạn" });
        }
        const user = yield user_model_1.default.findOne({ email, deleted: false });
        if (!user) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
        }
        const newPassword = generateHelper.generateValidPassword();
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        yield forgot_password_model_1.default.deleteOne({ _id: forgotPassword._id });
        const subject = "Mật khẩu mới của bạn";
        const html = `
      <h2>Xin chào ${user.full_name || user.username}!</h2>
      <p>Mật khẩu mới của bạn là: <b style="color: green;">${newPassword}</b></p>
      <p>Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này.</p>
      <p>Vì lý do bảo mật, không chia sẻ mật khẩu với bất kỳ ai.</p>
    `;
        (0, sendMail_1.sendEmail)(email, subject, html);
        return res
            .status(200)
            .json({ code: 200, message: "Xác thực thành công. Mật khẩu mới đã được gửi về email của bạn." });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.verifyForgotPassword = verifyForgotPassword;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, fullName, role, dob } = req.body;
        const existedUser = yield user_model_1.default.findOne({ $or: [{ username }, { email }], deleted: false });
        if (existedUser) {
            return res.status(409).json({ code: 409, message: "Tên đăng nhập hoặc email đã tồn tại" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield user_model_1.default.create({
            username,
            email,
            password: hashedPassword,
            full_name: fullName,
            role,
            dob,
            email_verified: false,
            status: "ACTIVE",
        });
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            role: user.role,
            avatarUrl: user.avatarUrl,
            username: user.username,
        }, JWT_SECRET);
        user.token = token;
        yield user.save();
        return res.status(201).json({ code: 201, message: "Tạo tài khoản thành công", result: user });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.createUser = createUser;
