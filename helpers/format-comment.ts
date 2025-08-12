import { Types } from "mongoose";
import DocumentComment from "../api/v1/models/document-comment.model";

interface CommentResponse {
  id: Types.ObjectId;
  content: string;
  userId: string;
  username: string;
  parentId: Types.ObjectId | null;
  replies: CommentResponse[];
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function mapCommentToResponse(comment: any): Promise<CommentResponse> {
  // Get replies if this is a parent comment
  const replies = await DocumentComment.find({ parent_id: comment._id })
    .populate("user_id", "username")
    .sort({ createdAt: 1 });

  const repliesFormatted = await Promise.all(
    replies.map(mapCommentToResponse)
  );

  return {
    id: comment._id,
    content: comment.content,
    userId: comment.user_id._id,
    username: comment.user_id.username,
    parentId: comment.parent_id,
    replies: repliesFormatted,
    likesCount: comment.likes_count,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt
  };
}