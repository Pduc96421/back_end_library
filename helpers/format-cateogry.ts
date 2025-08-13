import { Types } from "mongoose";

interface CategoryResponse {
  id: Types.ObjectId;
  name: string;
  status: string;
  description: string;
}

export function formatCategory(category: any): CategoryResponse {
  return {
    id: category._id,
    name: category.name,
    status: category.status || "ACTIVE",
    description: category.description || ""
  };
}