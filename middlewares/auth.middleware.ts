import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): any => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ code: 401, message: "Không có token" });

  jwt.verify(token, process.env.JWT_SECRET, (err: any, user: object) => {
    if (err) return res.status(403).json({ code: 403, message: "Token không hợp lệ" });
    req.user = user;
    next();
  });
};

export const verifyAdmin = (req: Request, res: Response, next: NextFunction): any => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ code: 403, message: "Token từ chối truy cập" });
  }
  next();
};
