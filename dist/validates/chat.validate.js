"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactMessage = exports.updateMessage = exports.sendFileMessage = exports.sendMessage = void 0;
const sendMessage = (req, res, next) => {
    const { room_chat_id, content } = req.body;
    if (!room_chat_id || !content) {
        return res.status(400).json({ code: 400, message: "room_chat_id and content are required" });
    }
    next();
};
exports.sendMessage = sendMessage;
const sendFileMessage = (req, res, next) => {
    const { room_chat_id } = req.body;
    if (!room_chat_id) {
        return res.status(400).json({ code: 400, message: "room_chat_id is required" });
    }
    if (!req.file) {
        return res.status(400).json({ code: 400, message: "File is required" });
    }
    next();
};
exports.sendFileMessage = sendFileMessage;
const updateMessage = (req, res, next) => {
    const { content } = req.body;
    if (!content || content.trim() === "") {
        return res.status(400).json({ code: 400, message: "Content is required" });
    }
    next();
};
exports.updateMessage = updateMessage;
const reactMessage = (req, res, next) => {
    const { icon } = req.body;
    if (!icon) {
        return res.status(400).json({ code: 400, message: "Missing icon reaction" });
    }
    next();
};
exports.reactMessage = reactMessage;
