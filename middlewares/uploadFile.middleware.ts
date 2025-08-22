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
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});
// ===================================

// ====== Hàm xử lý upload file bằng stream (buffer) ======
const streamUpload = (buffer: Buffer, options: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error: any, result: any) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ====== Middleware upload file và ảnh preview ======
export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: "Không tìm thấy file" });
    }

    const fileExtension = req.file.originalname.split(".").pop()?.toLowerCase();
    const publicId = `${Date.now()}_${req.file.originalname.split(".")[0]}`;

    const fileOptions = {
      folder: "library-documents",
      public_id: publicId,
      resource_type: "auto", // hoặc "raw"
      type: "upload",
      format: fileExtension,
    };

    const fileResult: any = await streamUpload(req.file.buffer, fileOptions);

    // Gán URL của file gốc vào req.body.file
    req.body.file = fileResult.secure_url;

    // Nếu là PDF, tạo ảnh preview
    if (fileExtension === "pdf") {
      const previewPromises = Array.from({ length: 5 }, (_, i) => {
        const previewOptions = {
          folder: "library-documents/previews",
          resource_type: "image",
          type: "upload",
          format: "jpg",
          transformation: [{ page: i + 1 }, { quality: "auto" }, { fetch_format: "auto" }],
        };
        return streamUpload(req.file!.buffer, previewOptions);
      });

      const previewResults = await Promise.all(previewPromises);
      req.body.preview_urls = previewResults.map((result: any) => result.secure_url);
    } else {
      req.body.preview_urls = [];
    }

    next();
  } catch (error) {
    return res.status(500).json({ code: 500, message: "Lỗi upload Cloudinary", error });
  }
};
