import Comment, { type CommentInterface } from "../../models/comment.schema.js";
import mongoose, { type FlattenMaps, type ObjectId } from "mongoose";
import { NotificationType } from "../../models/notification.schema.js";
import Track from "../../models/track.schema.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import { Types } from "mongoose";
import CommentLike, {
  type CommentLikeInterface,
} from "../../models/commentLike.schema.js";
import mainQueue from "../../queues/main.queue.js";
import logger from "../../utils/logger.js";
import { postNewNotification, notifyAdmins } from "../notification.service.js";
import { isSelfAction } from "../../utils/helpers.js";

/* Post comments notification */
export async function sendCommentNotification({
  type,
  targetUserId,
  actorUserId,
  resourceId,
  entityId,
}: {
  type: string;
  targetUserId: string;
  actorUserId: string | ObjectId;
  resourceId: string | ObjectId;
  entityId: string | ObjectId;
}) {
  if (isSelfAction(targetUserId, actorUserId)) return;

  switch (type) {
    case NotificationType.COMMENT_REPLIED: {
      const replyComment = (await Comment.findOne({
        _id: entityId,
      }).populate("userId", "username  _id")) as PopulatedComment | null;

      await postNewNotification({
        userId: targetUserId,
        message: `${replyComment?.userId.username || "Someone"} replied to your comment.`,
        type,
        resourceId,
        entityId,
      });
      break;
    }

    case NotificationType.COMMENT_REPLIED: {
      const comment = (await Comment.findOne({
        _id: entityId,
      }).populate("userId", "username  _id")) as PopulatedComment | null;

      await notifyAdmins(
        `${comment?.userId.username || "Someone"} commented on your track.`,
        type,
        resourceId,
        entityId,
      );
      break;
    }

    case NotificationType.COMMENT_LIKED: {
      const commentLike = (await CommentLike.findOne({
        userId: actorUserId,
      }).populate("userId", "username _id")) as PopulatedLike | null;

      await postNewNotification({
        userId: targetUserId,
        message: `${commentLike?.userId.username || "Someone"} liked your comment on a track.`,
        type,
        resourceId,
        entityId,
      });
    }

    default: {
      logger.debug(`Unidentified comment notification type: ${type}`);
      break;
    }
  }
}

/* Post a comment */
export const postNewComment = async (
  trackId: string,
  userId: string,
  { parentId, content }: CommentInterface,
): Promise<CommentInterface> => {
  const track = await Track.findOne({ _id: trackId });
  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found.",
      404,
      true,
      null,
    );

  let parentComment: CommentInterface | null = null;
  if (parentId) {
    parentComment = await Comment.findOne({ _id: parentId });

    if (!parentComment)
      throw new AppError(
        ErrorCodes.PARENT_COMMENT_NOT_FOUND,
        "Comment not found.",
        404,
        true,
        null,
      );
  }

  const comment = await Comment.create({ content, parentId, trackId, userId });

  const targetUserId = parentComment?.userId || null;
  const actorUserId = userId;

  const notificationType = parentComment
    ? NotificationType.COMMENT_REPLIED
    : NotificationType.TRACK_COMMENTED;

  await mainQueue.add(
    "send-comments-notification",
    {
      targetUserId,
      actorUserId,
      type: notificationType,
      resourceId: trackId,
      entityId: comment._id,
    },
    {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  );

  return comment;
};

/* Get comment and replies */
export interface PopulatedComment extends Omit<CommentInterface, "userId"> {
  _id: Types.ObjectId;
  userId: {
    _id: string;
    username: string;
    isVerified: string;
    avatar: string;
  };
  replies?: PopulatedComment[];
}

type commentsMap = Map<string, PopulatedComment>;
async function getTrackCommentsAndBuildTree(
  trackId: string,
): Promise<commentsMap> {
  let comments = await Comment.find({ trackId })
    .populate("userId", "_id username isVerified avatar")
    .lean<PopulatedComment[]>();

  const commentsTree = new Map<string, any>();
  comments.forEach((comment) => {
    comment.replies = [];
    commentsTree.set(comment._id.toString(), comment);
  });

  // Build comments tree
  commentsTree.forEach((comment) => {
    if (comment.parentId) {
      const parentComment = commentsTree.get(comment.parentId.toString());
      if (!parentComment) return;
      parentComment.replies.push(comment);
    }
  });

  return commentsTree;
}

export const getCommentAndReplies = async (
  commentId: string,
  trackId: string,
): Promise<PopulatedComment> => {
  const track = await Track.findOne({ _id: trackId });
  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found.",
      404,
      true,
      null,
    );

  const commentsTree = await getTrackCommentsAndBuildTree(trackId);

  const comment: PopulatedComment | undefined = commentsTree.get(commentId);
  if (!comment)
    throw new AppError(
      ErrorCodes.COMMENT_NOT_FOUND,
      "Comment not found.",
      404,
      true,
      null,
    );

  return comment;
};

/* Get all comment */
export const getAllComments = async (
  id: string,
): Promise<PopulatedComment[]> => {
  const track = await Track.findOne({ _id: id });
  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found.",
      404,
      true,
      null,
    );

  const commentsTree = await getTrackCommentsAndBuildTree(id);

  const rootComments: PopulatedComment[] = [];
  commentsTree.forEach((comment) => {
    if (comment.parentId) return;
    rootComments.push(comment);
  });

  return rootComments;
};

/* Update comment */
export const updateComment = async (
  commentId: string,
  trackId: string,
  userId: string,
  content: string,
): Promise<PopulatedComment> => {
  const updatedComment: PopulatedComment | null =
    await Comment.findOneAndUpdate(
      {
        _id: commentId,
        trackId,
        userId,
      },
      { $set: { content } },
      { new: true },
    );

  if (!updatedComment)
    throw new AppError(
      ErrorCodes.COMMENT_NOT_FOUND,
      "Comment not found.",
      404,
      true,
      null,
    );

  const commentsTree = await getTrackCommentsAndBuildTree(trackId);
  const comment = commentsTree.get(updatedComment._id.toString());

  return comment!;
};

/* Delete a comment */
export const deleteComment = async (
  commentId: string,
  id: string,
  userId: string,
): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const deleted = await Comment.deleteOne({
        _id: commentId,
        trackId: id,
        userId,
      }).session(session);

      if (deleted.deletedCount !== 1)
        throw new AppError(
          ErrorCodes.COMMENT_NOT_FOUND,
          "Comment not found.",
          404,
          true,
          null,
        );

      await Comment.deleteMany({
        parentId: commentId,
        trackId: id,
      }).session(session);
    });
    //
  } finally {
    session.endSession();
  }
};

/* Like comment */
export interface PopulatedLike extends Omit<CommentLikeInterface, "userId"> {
  userId: {
    _id: string | ObjectId;
    username: string;
    avatar: string;
  };
  commentId: ObjectId;
}

export const likeComment = async (
  userId: string,
  commentId: string,
  trackId: string,
): Promise<{ likesCount: number }> => {
  let likesCount: number = 0;
  let updatedComment: CommentInterface | null = null;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId },
        { $inc: { likes: 1 } },
        { new: true, session },
      );

      if (!updatedComment)
        throw new AppError(
          ErrorCodes.COMMENT_NOT_FOUND,
          "Comment not found.",
          404,
          true,
          null,
        );

      const newCommentLike = new CommentLike({
        userId,
        commentId,
      });

      await newCommentLike.save({ session });
      likesCount = updatedComment.likes;

      if (newCommentLike) {
        const targetUserId = updatedComment.userId;
        const actorUserId = newCommentLike.userId;

        await mainQueue.add(
          "send-comments-notification",
          {
            targetUserId,
            actorUserId,
            type: NotificationType.COMMENT_LIKED,
            resourceId: trackId,
            entityId: updatedComment._id,
          },
          {
            attempts: 2,
            backoff: {
              type: "exponential",
              delay: 2000,
            },
            removeOnComplete: 1000,
            removeOnFail: 5000,
          },
        );
      }
    });

    return { likesCount };
  } catch (error: any) {
    if (error.code === 11000) {
      const comment = await Comment.findOne({ _id: commentId });
      return { likesCount: comment!.likes };
    }

    throw error;
  } finally {
    session.endSession();
  }
};

/* Get Comment likes */
export interface CommentLikes {
  likesCount: number;
  likedBy: PopulatedLike[];
}

export const getAllCommentLikes = async (
  commentId: string,
): Promise<CommentLikes> => {
  const comment: CommentInterface | null = await Comment.findOne({
    _id: commentId,
  }).lean<CommentInterface>();

  if (!comment)
    throw new AppError(
      ErrorCodes.COMMENT_NOT_FOUND,
      "Comment not found.",
      404,
      true,
      null,
    );

  const commentLikes: any[] = await CommentLike.find({
    commentId,
  }).populate("userId", "username avatar _id"); //.lean();

  return { likesCount: comment.likes, likedBy: commentLikes };
};

/* Delete comment like */
export const deleteCommentLike = async (
  userId: string,
  commentId: string,
): Promise<{ likesCount: number }> => {
  const session = await mongoose.startSession();
  try {
    let likesCount: number = 0;
    let updatedComment: CommentInterface | null = null;

    await session.withTransaction(async () => {
      updatedComment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        { $inc: { likes: -1 } },
        { new: true, session },
      );

      if (!updatedComment)
        throw new AppError(
          ErrorCodes.COMMENT_NOT_FOUND,
          "Comment not found.",
          404,
          true,
          null,
        );

      const deletedLike = await CommentLike.deleteOne({
        userId,
        commentId,
      }).session(session);

      if (!deletedLike.acknowledged || deletedLike.deletedCount <= 0) {
        throw new AppError(
          ErrorCodes.LIKE_NOT_FOUND,
          "You haven't liked this comment.",
          400,
          true,
          null,
        );
      }

      likesCount = updatedComment.likes;
    });

    return { likesCount };
  } finally {
    session.endSession();
  }
};
