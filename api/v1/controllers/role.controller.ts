import { Request, Response } from "express";
import Role from "../models/role.model";

// Get /roles
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find();
    return res.status(200).json({ code: 200, message: "Lấy danh sách vai trò thành công", result: roles });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Post /roles
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ code: 400, message: "Thiếu tên vai trò" });
    }
    const existed = await Role.findOne({ name });
    if (existed) {
      return res.status(409).json({ code: 409, message: "Vai trò đã tồn tại" });
    }
    const role = await Role.create({ name, description });
    return res.status(201).json({ code: 201, message: "Tạo vai trò thành công", result: role });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};

// Delete /roles/:role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const deleted = await Role.findOneAndDelete({ name: role });
    if (!deleted) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy vai trò" });
    }
    return res.status(200).json({ code: 200, message: "Xóa vai trò thành công" });
  } catch (error: any) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ", error: error.message });
  }
};
