import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../helpers/sendMail";
import * as generateHelper from "../../../helpers/generate";
import * as sendMailHelper from "../../../helpers/sendMail";
import ForgotPassword from "../models/forgot-password.model";
import { getPagination } from "../../../helpers/pagination";
import { mapUserFullResponse } from "../../../helpers/format-user";
import UserLibrary from "../models/user-library.model";
import LibraryDocument from "../models/library-document.model";

const JWT_SECRET = process.env.JWT_SECRET;

// Get /users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page, size, skip } = getPagination(req.query);

    const docPage = parseInt((req.query.docPage as string) || "1");
    const docSize = parseInt((req.query.docSize as string) || "10");

    const users = await User.find({ deleted: false }).skip(skip).limit(size);
    const totalElements = await User.countDocuments({ deleted: false });
    const totalPages = Math.ceil(totalElements / size);

    const content = await Promise.all(users.map((user: any) => mapUserFullResponse(user, docPage, docSize)));

    const result = { content, page, size, totalElements, totalPages };

    return res.status(200).json({ code: 200, message: "Lấy danh sách người dùng thành công", result });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /users/search
export const searchUsers = async (req: Request, res: Response) => {
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

    const { page, size, skip } = getPagination(req.query);
    const docPage = parseInt((req.query.docPage as string) || "1");
    const docSize = parseInt((req.query.docSize as string) || "10");

    const users = await User.find(search).skip(skip).limit(size);
    const totalElements = await User.countDocuments(search);
    const totalPages = Math.ceil(totalElements / size);

    const content = await Promise.all(users.map((user: any) => mapUserFullResponse(user, docPage, docSize)));

    const result = { content, page, size, totalElements, totalPages };

    return res.status(200).json({ code: 200, message: "Tìm kiếm thành công", result });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /users/my-info
export const getMyInfo = async (req: Request, res: Response) => {
  try {
    const docPage = parseInt((req.query.docPage as string) || "1");
    const docSize = parseInt((req.query.docSize as string) || "10");

    const userId = (req as any).user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
    }

    const content = await mapUserFullResponse(user, docPage, docSize);

    return res.status(200).json({ code: 200, message: "Lấy thông tin cá nhân thành công", result: content });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /users/library
export const getLibrary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const libraries = await UserLibrary.find({ user_id: userId });

    const result = await Promise.all(
      libraries.map(async (library) => {
        const user = await User.findById(userId).select("username avatar phone_number");

        const documentCount = await LibraryDocument.countDocuments({ library_id: library._id });

        return {
          id: library._id,
          user: {
            id: userId,
            userName: user?.username || "",
            avatarUser: user?.avatarUrl || "",
            phoneNumber: user?.phone_number || "",
          },
          name: library.name,
          description: library.description,
          documentCount,
        };
      }),
    );

    return res.status(200).json({ code: 200, message: "Lấy thư viện cá nhân thành công", result });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /users/sent-confirm-account
export const sentConfirmAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email, deleted: false });

    if (!user) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    // 1: tạo mã otp và lưu otp, email yêu cầu vào collection
    const otp = generateHelper.generateRandomString(10);

    const objectConfirmAccount = {
      email: email,
      otp: otp,
      action: "confirm-account",
      expireAt: Date.now(),
    };

    const confirmAccount = new ForgotPassword(objectConfirmAccount);
    await confirmAccount.save();
    // end tạo mã otp và lưu thông tin yêu cầu vào collection

    // 2:  gửi mã otp qua email của user
    const subject = "Mã OTP xác thực tài khoản.";
    const htmlSendMail = `Mã OTP xác thực của bạn là <b style="color: green;">${otp}</b>. Mã OTP có hiệu lực trong 5 phút. Vui lòng không cung cấp mã OTP cho người khác.`;

    sendMailHelper.sendEmail(email, subject, htmlSendMail);
    // end 2:  gửi mã otp qua email của user

    res.status(200).json({
      code: 200,
      message: "OTP confirm account sent to email successfully",
    });
  } catch (error) {
    res.status(500).send({ code: 500, error: error.message });
  }
};

// GET /users/confirm-account/
export const confirmAccount = async (req: Request, res: Response) => {
  try {
    const { email, otpConfirm } = req.body;

    const forgot = await ForgotPassword.findOne({
      email: email,
      otp: otpConfirm,
      action: "confirm-account",
    }).sort({ createdAt: -1 });

    if (!forgot) {
      return res.status(404).json({ code: 404, message: "Mã xác thực không đúng hoặc đã hết hạn" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy tài khoản để xác nhận" });
    }
    user.email_verified = true;
    await user.save();

    await ForgotPassword.deleteOne({ _id: forgot._id });

    return res.status(200).json({ code: 200, message: "Xác nhận tài khoản thành công" });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Get /users/:userId
export const getUser = async (req: Request, res: Response) => {
  try {
    const docPage = parseInt((req.query.docPage as string) || "1");
    const docSize = parseInt((req.query.docSize as string) || "10");
    const { userId } = req.params;

    const user = await User.findById({ userId, deleted: false });
    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
    }

    const content = await mapUserFullResponse(user, docPage, docSize);

    return res.status(200).json({ code: 200, message: "Lấy thông tin người dùng thành công", result: content });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Put /users/:userId
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const myUserId = req.user.id;

    if (req.user.role !== "admin") {
      if (userId !== myUserId) {
        return res.status(403).json({ code: 403, message: "Bạn không có quyền để update user này" });
      }
    }

    await User.updateOne({ _id: userId, deleted: false }, { $set: updateData });
    const updatedUser = await User.findById(userId);

    return res.status(200).json({ code: 200, message: "Cập nhật thông tin thành công", result: updatedUser });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Delete /users/:userId
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { deleted: true, deletedAt: new Date() });
    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
    }
    return res.status(200).json({ code: 200, message: "Xóa người dùng thành công", result: userId });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Put /users/change-password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ code: 400, message: "Thiếu thông tin đổi mật khẩu" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(422).json({ code: 422, message: "Mật khẩu mới và xác nhận không khớp" });
    }
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ code: 401, message: "Mật khẩu hiện tại không đúng" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ code: 200, message: "Đổi mật khẩu thành công", result: "OK" });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /users/register
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, dob } = req.body;
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ code: 400, message: "Thiếu thông tin đăng ký" });
    }
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
      return res.status(409).json({ code: 409, message: "Tên đăng nhập hoặc email đã tồn tại" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      full_name: fullName,
      dob,
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        avatarUrl: user.avatarUrl,
        username: user.username,
      },
      JWT_SECRET,
    );
    user.token = token;
    await user.save();

    return res.status(201).json({ code: 201, message: "Đăng ký tài khoản thành công", result: user });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /users.open-account/:userId
export const openAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { status: "ACTIVE" }, { new: true });
    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
    }
    return res.status(200).json({ code: 200, message: "Mở khóa tài khoản thành công", result: user });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /users/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ code: 400, message: "Thiếu email" });
    }
    const user = await User.findOne({ email, deleted: false });
    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng với email này" });
    }

    const otp = generateHelper.generateRandomNumber(6);

    await ForgotPassword.create({
      email,
      otp,
      action: "reset-password",
      expireAt: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
    });

    // Gửi email
    const subject = "Yêu cầu đặt lại mật khẩu";
    const html = `Mã OTP xác thực của bạn là <b style="color: green;">${otp}</b>. Mã OTP có hiệu lực trong 5 phút. Vui lòng không cung cấp mã OTP cho người khác.`;
    sendEmail(email, subject, html);

    return res.status(200).json({ code: 200, message: "Đã gửi mã xác thực đặt lại mật khẩu về email", result: "OK" });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /users/create
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, role, dob } = req.body;

    const existedUser = await User.findOne({ $or: [{ username }, { email }], deleted: false });

    if (existedUser) {
      return res.status(409).json({ code: 409, message: "Tên đăng nhập hoặc email đã tồn tại" });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      full_name: fullName,
      role,
      dob,
      email_verified: false,
      status: "ACTIVE",
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        avatarUrl: user.avatarUrl,
        username: user.username,
      },
      JWT_SECRET,
    );
    user.token = token;
    await user.save();

    return res.status(201).json({ code: 201, message: "Tạo tài khoản thành công", result: user });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};
