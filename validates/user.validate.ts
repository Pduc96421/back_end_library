import { Request, Response, NextFunction } from "express";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;

const validateInput = (req: Request, res: Response, next: NextFunction): any => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ code: 400, message: "Vui lòng nhập tên đăng nhập và mật khẩu" });
    return;
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      code: 400,
      message:
        "Mật khẩu phải có ít nhất 6 kí tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 kí tự đặc biệt.",
    });
  }
  next();
};

const forgotPassword = (req: Request, res: Response, next: NextFunction): any => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ code: 400, message: "Please enter Email" });
  }

  next();
};

const resetPassword = (req: Request, res: Response, next: NextFunction): any => {
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
      message:
        "Mật khẩu mới phải có ít nhất 6 kí tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 kí tự đặc biệt.",
    });
  }

  next();
};

export const login = validateInput;
export const register = validateInput;
export const forgotPasswordPost = forgotPassword;
export const resetPasswordPost = resetPassword;

export const createUser = (req: Request, res: Response, next: NextFunction): any => {
  const { username, email, password, fullName, role, dob } = req.body;

  if (!username || !email || !password || !fullName || !role) {
    return res.status(400).json({
      code: 400,
      message: "Thiếu thông tin bắt buộc (username, email, password, fullName, role)",
    });
  }

  next();
};
