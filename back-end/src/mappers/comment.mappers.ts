import type { ObjectId } from "mongoose";
import type { CommentInterface } from "../models/comment.schema.js";
import type {
  PopulatedComment,
  PopulatedLike,
} from "../services/tracks/trackComments.service.js";
import { type CommentLikes } from "../services/tracks/trackComments.service.js";

interface user {
  id: string;
  username: string;
  avatar: string;
}

export interface CommentResponse {
  id: string;
  likes: number;
  content: string;
  user?: user;
  replies?: CommentResponse[];
  parentId: string | null;
  createdAt: Date;
}

/* Comment mapper */
export function mapSingle(comment: CommentInterface): CommentResponse {
  return {
    id: String(comment._id),
    likes: comment.likes,
    content: comment.content,
    parentId: comment.parentId?.toString() || null,
    createdAt: comment.createdAt,
  };
}

export function mapSingleWithReplies(
  comment: PopulatedComment,
): CommentResponse {
  let repliesMap: any[] = [];

  if (comment.replies && comment.replies.length > 0) {
    repliesMap = comment.replies.map((reply) => {
      return mapSingleWithReplies(reply);
    });
  }

  return {
    id: comment._id.toString() as string,
    likes: comment.likes,
    content: comment.content,
    user: {
      id: comment.userId._id,
      username: comment.userId.username,
      avatar: comment.userId.avatar,
    },
    parentId: comment.parentId?.toString() || null,
    replies: repliesMap,
    createdAt: comment.createdAt,
  };
}

export function mapMultipleWithReplies(comments: PopulatedComment[]) {
  return comments.map((comment) => {
    return mapSingleWithReplies(comment);
  });
}

/* Comment liked by mapper */
interface CommentLike {
  user: user;
  commentId: string;
  createdAt: Date;
}

export interface CommentLikesResponse {
  likesCount: number;
  likedBy: CommentLike[];
}

export function mapCommentLikedBy(commentLike: PopulatedLike) {
  return {
    user: {
      id: String(commentLike.userId._id),
      username: commentLike.userId.username,
      avatar: commentLike.userId.avatar,
    },
    commentId: String(commentLike._id),
    createdAt: commentLike.createdAt,
  };
}

export function mapCommentLikes(
  commentLikedBy: CommentLikes,
): CommentLikesResponse {
  const likes: CommentLike[] = commentLikedBy.likedBy.map((like) => {
    return mapCommentLikedBy(like);
  });

  return {
    likesCount: commentLikedBy.likesCount,
    likedBy: likes,
  };
}
