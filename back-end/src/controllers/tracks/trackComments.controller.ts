import type { Request, Response, NextFunction } from "express";
import { type ApiResponse } from "../responseInterface.js";
import * as commentService from "../../services/tracks/trackComments.service.js";
import { type populatedComment } from "../../services/tracks/trackComments.service.js";
import { type CommentInterface } from "../../models/comment.schema.js";
import { validateTrackidParam } from "../../utils/validators/track.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import * as trackValidator from "../../utils/validators/track.validator.js";

/* Post new comment controller */
export const postComment = async (
  req: Request<
    { id: string },
    ApiResponse<CommentInterface>,
    CommentInterface,
    {}
  >,
  res: Response<ApiResponse<CommentInterface>>,
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

    const response: ApiResponse<CommentInterface> = {
      status: true,
      message: "Comment posted sucessfully.",
      data: comment,
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get a comment controller  */
interface getCommentParam {
  commentId: string;
  id: string;
} //getCommentParam
export const getComment = async (
  req: Request<{}, ApiResponse<populatedComment>, {}, {}>,
  res: Response<ApiResponse<populatedComment>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { commentId, id }: getCommentParam = validateAndSanitizeBody(
      req.params,
      trackValidator.getCommentParamBody,
    );

    // get comment
    const comment: populatedComment = await commentService.getCommentAndReplies(
      commentId,
      id,
    );

    const response: ApiResponse<populatedComment> = {
      status: true,
      message: "Comment retrieved successfully.",
      data: comment,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get all comments controller*/
export const getAllComment = async (
  req: Request<{ id: string }, ApiResponse<populatedComment[]>, {}, {}>,
  res: Response<ApiResponse<populatedComment[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    // get comment
    const comments: populatedComment[] =
      await commentService.getAllComments(id);
    const response: ApiResponse<populatedComment[]> = {
      status: true,
      message: "Comments retrieved successfully.",
      data: comments,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update comment controller */
export const updateComment = async (
  req: Request<
    { id: string; commentId: string },
    ApiResponse<populatedComment>,
    { content: string },
    {}
  >,
  res: Response<ApiResponse<populatedComment>>,
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

    const response: ApiResponse<populatedComment> = {
      status: true,
      message: "Comment was updated sucessfully.",
      data: updatedComment,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Delete a comment controller */
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
    ApiResponse<commentService.CommentLikes>,
    {},
    {}
  >,
  res: Response<ApiResponse<commentService.CommentLikes>>,
  next: NextFunction,
) => {
  try {
    const commentId = req.params.commentId;

    const data = await commentService.getAllCommentLikes(commentId);

    const response: ApiResponse<commentService.CommentLikes> = {
      status: true,
      message: "Comment likedBy retrieved successfully.",
      data: data,
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
