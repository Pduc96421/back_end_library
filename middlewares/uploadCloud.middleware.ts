import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Mở rộng interface Request để hỗ trợ req.file
declare module "express-serve-static-core" {
  interface Request {
    file?: Express.Multer.File;
  }
}

// ====== Cấu hình Cloudinary ======
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_SECRET,
});
// ===================================

// ====== Middleware xử lý upload file bằng stream (buffer) ======
const streamUpload = (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error: any, result: any) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Middleware upload cho file dùng buffer (dành cho avatar, ảnh nhỏ,...)
export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.file) {
      const result: any = await streamUpload(req.file.buffer);
      req.body[req.file.fieldname] = result.secure_url;
    }
    next();
  } catch (error) {
    return res.status(500).json({ code: 500, message: "Lỗi upload Cloudinary", error });
  }
};
// ===============================================================
