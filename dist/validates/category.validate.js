"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = void 0;
const createCategory = (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ code: 400, message: "Thiếu tên danh mục" });
    }
    next();
};
exports.createCategory = createCategory;
