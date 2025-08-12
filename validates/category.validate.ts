import { Request, Response, NextFunction } from "express";

export const createCategory = (req: Request, res: Response, next: NextFunction): any => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ code: 400, message: "Thiếu tên danh mục" });
    }

  next();
};