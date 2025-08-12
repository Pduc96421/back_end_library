import Category from "../api/v1/models/category.model";
import DocumentView from "../api/v1/models/document-view.model";
import DocumentLike from "../api/v1/models/document-like.model";
import DocumentDownload from "../api/v1/models/document-download.model";
import DocumentRating from "../api/v1/models/document-rating.model";
import DocumentTag from "../api/v1/models/document-tag.model";
import DocumentAccess from "../api/v1/models/document-access.model";
import { Types } from "mongoose";

interface DocumentAccess {
  document_id: Types.ObjectId;
  user_id: Types.ObjectId;
}

export async function mapDocumentToResponse(doc: any) {
  // Đếm views, likes, downloads
  const views = await DocumentView.countDocuments({ document_id: doc._id });
  const likes = await DocumentLike.countDocuments({ document_id: doc._id });
  const downloads = await DocumentDownload.countDocuments({ document_id: doc._id });

  // Tính averageRating
  const ratings = await DocumentRating.find({ document_id: doc._id });
  const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length : 0;

  // Lấy tags
  const tags = await DocumentTag.find({ document_id: doc._id }).select("id name");
  const tagList = tags.map((tag: any) => ({
    id: tag.id || tag._id,
    name: tag.name,
  }));

  // Lấy category
  let category = null;
  if (doc.category_id) {
    const cat = await Category.findById(doc.category_id);
    if (cat) {
      category = {
        id: cat._id,
        name: cat.name,
        status: cat.status || "",
        description: cat.description || "",
      };
    }
  }

  return {
    id: doc._id,
    title: doc.title,
    category,
    views,
    like: likes,
    downloads,
    averageRating,
    status: doc.status,
    tags: tagList,
    previewUrls: doc.preview_urls || [],
    description: doc.description,
    fileUrl: doc.file_url,
    fileType: doc.file_type,
    fileSize: doc.file_size,
    isPublic: doc.is_public,
  };
}

export async function getAccessibleDocumentIds(userId: string): Promise<string[]> {
  const accessRecords = (await DocumentAccess.find({ user_id: userId })) as DocumentAccess[];
  return accessRecords.map((record) => record.document_id.toString());
}
