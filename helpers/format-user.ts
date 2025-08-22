import Document from "../api/v1/models/document.model";
import { mapDocumentToResponse } from "../helpers/format-document";
import DocumentDownload from "../api/v1/models/document-download.model";
import { getPagination } from "./pagination";

export async function mapUserFullResponse(user: any, docPage = 1, docSize = 10) {
  // Lấy phân trang tài liệu của user
  const { page, size, skip } = getPagination({ page: docPage, size: docSize });
  const docs = await Document.find({ created_by: user._id }).skip(skip).limit(size);
  const totalElements = await Document.countDocuments({ created_by: user._id });
  const totalPages = Math.ceil(totalElements / size);

  const content = await Promise.all(docs.map(mapDocumentToResponse));

  // Đếm số lượt download của user
  const documentDownload = await DocumentDownload.countDocuments({ user_id: user._id });

  return {
    id: user._id,
    fullName: user.full_name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    status: user.status,
    dob: user.dob,
    emailVerified: user.email_verified,
    phoneNumber: user.phone_number,
    documents: {
      content,
      page,
      size,
      totalElements,
      totalPages,
    },
    documentDownload,
  };
}
