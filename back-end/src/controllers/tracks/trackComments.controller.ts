import type { Request, Response, NextFunction } from "express";
import { type ApiResponse } from "../responseInterface.js";
import * as commentService from "../../services/tracks/trackComments.service.js";
import { type populatedComment } from "../../services/tracks/trackComments.service.js";
import { type CommentInterface } from "../../models/comment.schema.js";

/* Post new comment controller */
export const postCommentController = async (
  req: Request<
    { id: string },
    ApiResponse<CommentInterface>,
    CommentInterface,
    {}
  >,
  res: Response<ApiResponse<CommentInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = req.body;
    const trackId = req.params.id;

    const comment = await commentService.postNewComment(trackId, userId, data);
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
export const getCommentController = async (
  req: Request<
    { commentId: string; id: string },
    ApiResponse<populatedComment>,
    {},
    {}
  >,
  res: Response<ApiResponse<populatedComment>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { commentId, id } = req.params;

    // get comment
    const comment: populatedComment = await commentService.getCommentAndReplies(
      commentId,
      id
    );
    const response: ApiResponse<populatedComment> = {
      status: true,
      message: "Comment retrive successfully.",
      data: comment,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get all comments controller*/
export const getAllCommentController = async (
  req: Request<{ id: string }, ApiResponse<populatedComment[]>, {}, {}>,
  res: Response<ApiResponse<populatedComment[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // get comment
    const comments: populatedComment[] = await commentService.getAllComments(
      id
    );
    const response: ApiResponse<populatedComment[]> = {
      status: true,
      message: "Comments retrived successfully.",
      data: comments,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update comment controller */
export const updateCommentController = async (
  req: Request<
    { id: string; commentId: string },
    ApiResponse<populatedComment>,
    { content: string },
    {}
  >,
  res: Response<ApiResponse<populatedComment>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user!.id;
    const content = req.body.content;

    const updatedComment = await commentService.updateComment(
      commentId,
      id,
      userId,
      content
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
export const deleteCommentController = async (
  req: Request<
    { id: string; commentId: string },
    ApiResponse<void>,
    { content: string },
    {}
  >,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user!.id;

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
