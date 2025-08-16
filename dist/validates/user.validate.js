"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.resetPasswordPost = exports.forgotPasswordPost = exports.register = exports.login = void 0;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
const validateInput = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ code: 400, message: "Vui lòng nhập tên đăng nhập và mật khẩu" });
        return;
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            code: 400,
            message: "Mật khẩu phải có ít nhất 6 kí tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 kí tự đặc biệt.",
        });
    }
    next();
};
const forgotPassword = (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ code: 400, message: "Please enter Email" });
    }
    next();
};
const resetPassword = (req, res, next) => {
    const { newPassword } = req.body;
    if (!newPassword) {
        return res.status(400).json({
            code: 400,
            message: "Vui lòng nhập đầy đủ thông tin cần thiết bao gồm mật khẩu mới và mật khẩu cữ ",
        });
    }
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            code: 400,
            message: "Mật khẩu mới phải có ít nhất 6 kí tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 kí tự đặc biệt.",
        });
    }
    next();
};
exports.login = validateInput;
exports.register = validateInput;
exports.forgotPasswordPost = forgotPassword;
exports.resetPasswordPost = resetPassword;
const createUser = (req, res, next) => {
    const { username, email, password, fullName, role, dob } = req.body;
    if (!username || !email || !password || !fullName || !role) {
        return res.status(400).json({
            code: 400,
            message: "Thiếu thông tin bắt buộc (username, email, password, fullName, role)",
        });
    }
    next();
};
exports.createUser = createUser;
