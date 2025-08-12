import { Types } from "mongoose";
import LibraryDocument from "../api/v1/models/library-document.model";
import { mapDocumentToResponse } from "./format-document";

interface LibraryResponse {
  id: Types.ObjectId;
  user: {
    id: Types.ObjectId;
    userName: string;
    avatarUser: string;
    phoneNumber: string;
  };
  name: string;
  description: string;
  documentCount: number;
}

interface LibraryDetailResponse extends LibraryResponse {
  document: {
    content: Array<{
      id: Types.ObjectId;
      document: any;
      status: string;
      note: string;
      progress: number;
    }>;
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export async function mapLibraryToResponse(library: any): Promise<LibraryResponse> {
  const documentCount = await LibraryDocument.countDocuments({
    library_id: library._id,
  });

  return {
    id: library._id,
    user: {
      id: library.user_id._id,
      userName: library.user_id.username || "",
      avatarUser: library.user_id.avatarUrl || "",
      phoneNumber: library.user_id.phone_number || "",
    },
    name: library.name,
    description: library.description,
    documentCount,
  };
}

export async function mapLibraryDetailResponse(
  library: any,
  page: number,
  size: number,
): Promise<LibraryDetailResponse> {
  const basicInfo = await mapLibraryToResponse(library);
  const skip = (page - 1) * size;

  const libraryDocuments = await LibraryDocument.find({ library_id: library._id })
    .skip(skip)
    .limit(size)
    .populate("document_id");

  const totalElements = await LibraryDocument.countDocuments({ library_id: library._id });
  const totalPages = Math.ceil(totalElements / size);

  const content = await Promise.all(
    libraryDocuments.map(async (libDoc) => ({
      id: libDoc._id,
      document: await mapDocumentToResponse(libDoc.document_id),
      status: libDoc.status || "UNREAD",
      note: libDoc.note || "",
      progress: libDoc.progress || 0,
    })),
  );

  return {
    ...basicInfo,
    document: {
      content,
      page,
      size,
      totalElements,
      totalPages,
    },
  };
}
