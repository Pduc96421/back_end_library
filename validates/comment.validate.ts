import { Request, Response, NextFunction } from "express";

export const addComment = (req: Request, res: Response, next: NextFunction): any => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ code: 400, message: "Thiếu nội dung bình luận" });
  }

  next();
};
