import { Request, Response, NextFunction } from "express";

export const sendMessage = (req: Request, res: Response, next: NextFunction): any => {
  const { room_chat_id, content } = req.body;

  if (!room_chat_id || !content) {
    return res.status(400).json({ code: 400, message: "room_chat_id and content are required" });
  }

  next();
};

export const sendFileMessage = (req: Request, res: Response, next: NextFunction): any => {
  const { room_chat_id } = req.body;

  if (!room_chat_id) {
    return res.status(400).json({ code: 400, message: "room_chat_id is required" });
  }

  if (!req.file) {
    return res.status(400).json({ code: 400, message: "File is required" });
  }

  next();
};

export const updateMessage = (req: Request, res: Response, next: NextFunction): any => {
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ code: 400, message: "Content is required" });
  }

  next();
};

export const reactMessage = (req: Request, res: Response, next: NextFunction): any => {
  const { icon } = req.body;

  if (!icon) {
    return res.status(400).json({ code: 400, message: "Missing icon reaction" });
  }

  next();
};
