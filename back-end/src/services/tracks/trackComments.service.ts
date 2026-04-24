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
import { postNewNotification } from "../notification.service.js";

/* Post a comment */
// export interface populatedComment extends Omit<CommentInterface, "userId"> {
//   userId: {
//     _id: string;
//     username: string;
//     email: string;
//     avatar: string;
//   };
// }

function isSelfAction(
  actorUserId: ObjectId | string | undefined | null,
  targetUserId: ObjectId | string | undefined | null,
): boolean {
  if (!targetUserId || !actorUserId) return false;
  return String(targetUserId) === String(actorUserId);
}

async function sendCommentNotification({
  targetUserId,
  // commentUserId = undefined,
  likeUserId = undefined,
  resourceId,
  entityId,
  type,
}: {
  targetUserId: ObjectId | null;
  // commentUserId?: ObjectId | undefined;
  likeUserId?: ObjectId | undefined;
  resourceId: string;
  entityId: string;
  type: string;
}): Promise<void> {
  switch (type) {
    case NotificationType.COMMENT_REPLIED: {
      if (!targetUserId) return;

      const replyComment = (await Comment.findOne({
        _id: entityId,
      }).populate("userId", "username  _id")) as populatedComment | null;

      console.log({ targetUserId, replyComment });

      // Don't send notification for self action
      const actorUserId = replyComment?.userId._id;
      if (isSelfAction(targetUserId, actorUserId)) return;

      await mainQueue.add(
        "post-notification",
        {
          userId: targetUserId,
          message: `${replyComment?.userId.username} replied to your comment.`,
          type: NotificationType.COMMENT_REPLIED,
          resourceId,
          entityId,
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

      break;
    }

    case NotificationType.TRACK_COMMENTED: {
      //
      const comment = (await Comment.findOne({
        _id: entityId,
      }).populate("userId", "username  _id")) as populatedComment | null;

      await mainQueue.add(
        "post-notification",
        {
          userId: null,
          message: `${comment?.userId._id} commented on your track.`,
          type: NotificationType.TRACK_COMMENTED,
          resourceId,
          entityId,
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

      break;
    }

    case NotificationType.COMMENT_LIKED: {
      if (!targetUserId) return;

      if (isSelfAction(targetUserId, likeUserId)) return;

      const commentLike = (await CommentLike.findOne({
        userId: likeUserId,
      }).populate("userId", "username _id")) as any | null;

      await mainQueue.add(
        "post-notification",
        {
          userId: targetUserId,
          message: `${commentLike?.userId.username} liked your comment on a track`,
          type: NotificationType.COMMENT_LIKED,
          resourceId,
          entityId,
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

      break;
    }

    default: {
      logger.debug(`Unidentified comment notification type: ${type}`);
      break;
    }
  }
}

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

  // Send comment notification
  const targetUserId = parentComment?.userId || null;
  const actorUserId = userId;

  if (!isSelfAction(targetUserId, actorUserId)) {
    const entityComment = (await Comment.findOne({
      userId,
    }).populate("userId", "username  _id")) as populatedComment | null;

    const notificationMessage = parentComment
      ? `${entityComment?.userId.username} replied to your comment.`
      : `${entityComment?.userId.username} commented on your track.`;

    const notificationType = parentComment
      ? NotificationType.COMMENT_REPLIED
      : NotificationType.TRACK_COMMENTED;

    await mainQueue.add(
      "post-notification",
      {
        userId: targetUserId,
        message: notificationMessage,
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
  }

  return comment;
};

/* Get comment and replies */
export interface populatedComment extends Omit<CommentInterface, "userId"> {
  _id: Types.ObjectId;
  userId: {
    _id: string;
    username: string;
    isVerified: string;
    avatar: string;
  };
  replies?: populatedComment[];
}

type commentsMap = Map<string, populatedComment>;
async function getTrackCommentsAndBuildTree(
  trackId: string,
): Promise<commentsMap> {
  let comments = await Comment.find({ trackId })
    .populate("userId", "_id username isVerified avatar")
    .lean<populatedComment[]>();

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
): Promise<populatedComment> => {
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

  const comment: populatedComment | undefined = commentsTree.get(commentId);
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
): Promise<populatedComment[]> => {
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

  const rootComments: populatedComment[] = [];
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
): Promise<populatedComment> => {
  const updatedComment: populatedComment | null =
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
interface populatedLike {
  userId: {
    _id: string | ObjectId;
    username: string;
    avatar: string;
  };
  commentId: string | ObjectId;
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

      // Send like notification
      const targetUserId = updatedComment.userId;
      const actorUserId = newCommentLike.userId;

      if (newCommentLike && !isSelfAction(targetUserId, actorUserId)) {
        const commentLike = (await CommentLike.findOne({
          userId: actorUserId,
        }).populate("userId", "username  _id")) as populatedLike | null;

        await mainQueue.add(
          "post-notification",
          {
            userId: targetUserId,
            message: `${commentLike?.userId.username} liked your comment on a track`,
            type: NotificationType.COMMENT_LIKED,
            resourceId: trackId,
            entityId: updatedComment._id as string,
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
  likedBy: FlattenMaps<CommentLikeInterface>[];
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

  const commentLikes = await CommentLike.find({ commentId })
    .populate("userId", "username avatar _id")
    .lean();

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
