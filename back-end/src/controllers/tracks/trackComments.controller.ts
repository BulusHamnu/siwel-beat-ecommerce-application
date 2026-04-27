import type { Request, Response, NextFunction } from "express";
import { type ApiResponse } from "../responseInterface.js";
import * as commentService from "../../services/tracks/trackComments.service.js";
import { type PopulatedComment } from "../../services/tracks/trackComments.service.js";
import { type CommentInterface } from "../../models/comment.schema.js";
import { validateTrackidParam } from "../../utils/validators/track.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import * as trackValidator from "../../utils/validators/track.validator.js";
import * as commentMapper from "../../mappers/comment.mappers.js";
import {
  type CommentResponse,
  type CommentLikesResponse,
} from "../../mappers/comment.mappers.js";

/* Post new comment  */
export const postComment = async (
  req: Request<
    { id: string },
    ApiResponse<CommentResponse>,
    CommentInterface,
    {}
  >,
  res: Response<ApiResponse<CommentResponse>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const trackId = validateTrackidParam(req.params.id);

    const commentBody = validateAndSanitizeBody(
      req.body,
      trackValidator.commentBodySchema,
    );

    const comment = await commentService.postNewComment(
      trackId,
      userId,
      commentBody,
    );

    const commentRes = commentMapper.toCommentRes(comment);
    const response: ApiResponse<CommentResponse> = {
      status: true,
      message: "Comment posted sucessfully.",
      data: commentRes,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get a comment   */
interface getCommentParam {
  commentId: string;
  id: string;
}

export const getComment = async (
  req: Request<{}, ApiResponse<CommentResponse>, {}, {}>,
  res: Response<ApiResponse<CommentResponse>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { commentId, id }: getCommentParam = validateAndSanitizeBody(
      req.params,
      trackValidator.getCommentParamBody,
    );

    const comment: PopulatedComment = await commentService.getCommentAndReplies(
      commentId,
      id,
    );

    const commentRes = commentMapper.toCommentResWithReplies(comment);
    const response: ApiResponse<CommentResponse> = {
      status: true,
      message: "Comment retrieved successfully.",
      data: commentRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get all comments */
export const getAllComment = async (
  req: Request<{ id: string }, ApiResponse<CommentResponse[]>, {}, {}>,
  res: Response<ApiResponse<CommentResponse[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const comments: PopulatedComment[] =
      await commentService.getAllComments(id);

    const commentsMap = commentMapper.toCommentsResWithReplies(comments);
    const response: ApiResponse<CommentResponse[]> = {
      status: true,
      message: "Comments retrieved successfully.",
      data: commentsMap,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update comment  */
export const updateComment = async (
  req: Request<
    { id: string; commentId: string },
    ApiResponse<CommentResponse>,
    { content: string },
    {}
  >,
  res: Response<ApiResponse<CommentResponse>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { commentId, id }: getCommentParam = validateAndSanitizeBody(
      req.params,
      trackValidator.getCommentParamBody,
    );
    const { content } = validateAndSanitizeBody(
      req.body,
      trackValidator.commentBodySchema,
    );

    const updatedComment = await commentService.updateComment(
      commentId,
      id,
      userId,
      content,
    );

    const commentRes = commentMapper.toCommentResWithReplies(updatedComment);

    const response: ApiResponse<CommentResponse> = {
      status: true,
      message: "Comment was updated sucessfully.",
      data: commentRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Delete a comment  */
export const deleteComment = async (
  req: Request<
    { id: string; commentId: string },
    ApiResponse<void>,
    { content: string },
    {}
  >,
  res: Response<ApiResponse<void>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { commentId, id }: getCommentParam = validateAndSanitizeBody(
      req.params,
      trackValidator.getCommentParamBody,
    );

    await commentService.deleteComment(commentId, id, userId);
    const response: ApiResponse<void> = {
      status: true,
      message: "Comment was deleted sucessfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Like comment */
export const likeComment = async (
  req: Request<
    { id: string; commentId: string },
    ApiResponse<{ likesCount: number }>,
    {},
    {}
  >,
  res: Response<ApiResponse<{ likesCount: number }>>,
  next: NextFunction,
) => {
  try {
    const trackId = req.params.id;
    const commentId = req.params.commentId;
    const userId = req.user!.id;

    const { likesCount } = await commentService.likeComment(
      userId,
      commentId,
      trackId,
    );

    const response: ApiResponse<{ likesCount: number }> = {
      status: true,
      message: "You liked this comment.",
      data: { likesCount },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/* Like comment */
export const getCommentLikes = async (
  req: Request<
    { id: string; commentId: string },
    ApiResponse<CommentLikesResponse>,
    {},
    {}
  >,
  res: Response<ApiResponse<CommentLikesResponse>>,
  next: NextFunction,
) => {
  try {
    const commentId = req.params.commentId;

    const data = await commentService.getAllCommentLikes(commentId);
    const commentLikedByRes = commentMapper.toCommentLikesRes(data);

    const response: ApiResponse<CommentLikesResponse> = {
      status: true,
      message: "Comment likes retrieved successfully.",
      data: commentLikedByRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Delete comment like */
export const deleteLike = async (
  req: Request<
    { id: string; commentId: string },
    ApiResponse<{ likesCount: number }>,
    {},
    {}
  >,
  res: Response<ApiResponse<{ likesCount: number }>>,
  next: NextFunction,
) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user!.id;

    const { likesCount } = await commentService.deleteCommentLike(
      userId,
      commentId,
    );

    const response: ApiResponse<{ likesCount: number }> = {
      status: true,
      message: "You removed your like from this comment.",
      data: { likesCount },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
