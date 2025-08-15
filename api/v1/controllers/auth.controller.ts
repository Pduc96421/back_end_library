import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Post /auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: "Thiếu tên đăng nhập hoặc mật khẩu" });
    }

    const user = await User.findOne({ username, deleted: false }).select("+password +token");
    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ code: 403, message: "Tài khoản bị khóa hoặc không hoạt động" });
    }

    if (!user.email_verified) {
      return res.status(402).json({ code: 402, message: "Email chưa được xác thực" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ code: 401, message: "Sai mật khẩu" });
    }

    const token = user.token;

    return res.status(200).json({ code: 200, message: "Đăng nhập thành công", result: { token } });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /auth/logout
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ code: 401, message: "Chưa xác thực" });
    }
    await User.findByIdAndUpdate(userId, { token: null });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /auth/refresh
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ code: 400, message: "Thiếu token" });
    }
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ code: 401, message: "Token không hợp lệ hoặc đã hết hạn" });
    }
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
    }
    const newToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      JWT_SECRET,
      // { expiresIn: JWT_EXPIRES_IN },
    );
    user.token = newToken;
    await user.save();
    return res.status(200).json({ code: 200, message: "Làm mới token thành công", result: { token: newToken } });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /auth/validate-token
export const validateToken = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ code: 200, message: "Token hợp lệ" });
  } catch (error: any) {
    return res.status(401).json({ code: 401, message: "Token không hợp lệ" });
  }
};

// Đăng nhập Google (giả lập)
export const googleLogin = async (req: Request, res: Response) => {
  // Thực tế sẽ redirect sang Google OAuth2
  return res.status(200).json({ message: "Chuyển hướng đăng nhập Google (giả lập)" });
};

// Callback Google (giả lập)
export const googleLoginSuccess = async (req: Request, res: Response) => {
  // Thực tế sẽ xử lý thông tin trả về từ Google
  return res.status(200).json({ message: "Đăng nhập Google thành công (giả lập)" });
};
