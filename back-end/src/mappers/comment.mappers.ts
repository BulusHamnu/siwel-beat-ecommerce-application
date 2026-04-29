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
export function toCommentRes(comment: CommentInterface): CommentResponse {
  return {
    id: String(comment._id),
    likes: comment.likes,
    content: comment.content,
    parentId: comment.parentId?.toString() || null,
    createdAt: comment.createdAt,
  };
}

export function toCommentResWithReplies(
  comment: PopulatedComment,
): CommentResponse {
  let repliesMap: any[] = [];

  if (comment.replies && comment.replies.length > 0) {
    repliesMap = comment.replies.map((reply) => {
      return toCommentResWithReplies(reply);
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

export function toCommentsResWithReplies(comments: PopulatedComment[]) {
  return comments.map((comment) => {
    return toCommentResWithReplies(comment);
  });
}

/* Comment liked by mapper */
interface CommentLike extends user {}

export interface CommentLikesResponse {
  likesCount: number;
  likedBy: CommentLike[];
}

export function toCommentLikedByRes(commentLike: PopulatedLike) {
  return {
    id: String(commentLike.userId?._id),
    username: commentLike.userId?.username,
    avatar: commentLike.userId?.avatar,
  };
}

export function toCommentLikesRes(
  commentLikedBy: CommentLikes,
): CommentLikesResponse {
  const likes: CommentLike[] = commentLikedBy.likedBy.map((like) => {
    return toCommentLikedByRes(like);
  });

  return {
    likesCount: commentLikedBy.likesCount,
    likedBy: likes,
  };
}
