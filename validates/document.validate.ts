import { Request, Response, NextFunction } from "express";

export const uploadDocument = (req: Request, res: Response, next: NextFunction): any => {
  const { title, category_id, tags } = req.body;
  const file = req.file;

  if (!title || !file || !category_id || !tags) {
    return res.status(400).json({ code: 400, message: "Thiếu thông tin tài liệu" });
  }

  next();
};

export const rateDocument = (req: Request, res: Response, next: NextFunction): any => {
  const { rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ code: 400, message: "Đánh giá phải từ 1-5 sao" });
  }

  if (!review) {
    return res.status(400).json({ code: 400, message: "Không được để trống đánh giá" });
  }

  next();
};

export const changeAccess = (req: Request, res: Response, next: NextFunction): any => {
  const { accessType } = req.body;

  if (!["VIEW", "DOWNLOAD", "EDIT"].includes(accessType)) {
    return res.status(400).json({ code: 400, message: "Loại quyền truy cập không hợp lệ" });
  }

  next();
};
