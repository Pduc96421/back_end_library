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
exports.validateToken = exports.refreshToken = exports.logout = exports.login = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ code: 400, message: "Thiếu tên đăng nhập hoặc mật khẩu" });
        }
        const user = yield user_model_1.default.findOne({ username, deleted: false }).select("+password +token");
        if (!user) {
            return res
                .status(404)
                .json({ code: 404, message: "Không tìm thấy người dùng" });
        }
        if (user.status !== "ACTIVE") {
            return res
                .status(403)
                .json({ code: 403, message: "Tài khoản bị khóa hoặc không hoạt động" });
        }
        if (!user.email_verified) {
            return res.status(402).json({
                code: 402,
                message: "Email chưa được xác thực",
                result: { email: user.email },
            });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ code: 401, message: "Sai mật khẩu" });
        }
        const token = user.token;
        return res
            .status(200)
            .json({ code: 200, message: "Đăng nhập thành công", result: { token } });
    }
    catch (error) {
        return res
            .status(500)
            .json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ code: 401, message: "Chưa xác thực" });
        }
        yield user_model_1.default.findByIdAndUpdate(userId, { token: null });
        return res.status(204).send();
    }
    catch (error) {
        return res
            .status(500)
            .json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.logout = logout;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ code: 400, message: "Thiếu token" });
        }
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (err) {
            return res
                .status(401)
                .json({ code: 401, message: "Token không hợp lệ hoặc đã hết hạn" });
        }
        const user = yield user_model_1.default.findById(payload.id);
        if (!user) {
            return res
                .status(404)
                .json({ code: 404, message: "Không tìm thấy người dùng" });
        }
        const newToken = jsonwebtoken_1.default.sign({
            id: user._id,
            role: user.role,
        }, JWT_SECRET);
        user.token = newToken;
        yield user.save();
        return res.status(200).json({
            code: 200,
            message: "Làm mới token thành công",
            result: { token: newToken },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ code: 500, message: "Lỗi máy chủ", error: error.message });
    }
});
exports.refreshToken = refreshToken;
const validateToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.status(200).json({ code: 200, message: "Token hợp lệ" });
    }
    catch (error) {
        return res.status(401).json({ code: 401, message: "Token không hợp lệ" });
    }
});
exports.validateToken = validateToken;
const google_auth_library_1 = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
function verifyToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const ticket = yield client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
    });
}
const AuthController = {
    googleLogin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token } = req.body;
            const payload = yield verifyToken(token);
            const { email, name } = payload;
            let user = yield user_model_1.default.findOne({ email, deleted: false });
            if (!user) {
                user = new user_model_1.default({
                    full_name: name,
                    username: email,
                    email,
                    email_verified: true,
                    status: "ACTIVE",
                    token: token,
                });
                yield user.save();
            }
            return res.status(200).json({
                code: 200,
                message: "Đăng nhập bằng Google thành công",
                result: { token },
            });
        }
        catch (error) {
            return res
                .status(500)
                .json({ code: 500, message: "Lỗi máy chủ", error: error.message });
        }
    }),
};
exports.default = AuthController;
