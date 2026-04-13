import Comment, { type CommentInterface } from "../../models/comment.schema.js";
import mongoose, { type FlattenMaps, type ObjectId } from "mongoose";
import * as notificationService from "../notification.service.js";
import { NotificationType } from "../../models/notification.schema.js";
import Track from "../../models/track.schema.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import Profile from "../../models/profile.schema.js";
import { Types } from "mongoose";
import type { UserProfile } from "../../controllers/userTypes.js";
import CommentLike, {
  type CommentLikeInterface,
} from "../../models/commentLike.schema.js";

/* Post a comment */
export interface parentComment extends Omit<CommentInterface, "userId"> {
  userId: {
    _id: string;
    username: string;
    email: string;
  };
}

async function sendCommentReplyNotification(
  parentId: ObjectId,
  entityId: string,
): Promise<void> {
  const parentComment = (await Comment.findOne({ _id: parentId }).populate(
    "userId",
    "username email _id",
  )) as parentComment | null;

  if (!parentComment) return;

  await notificationService.postNewNotification(
    parentComment?.userId._id!,
    `${parentComment?.userId.username} replied to your comment.`,
    "COMMENT_REPLIED",
    entityId,
  );
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

  const comment = await Comment.create({ content, parentId, trackId, userId });
  if (parentId) {
    // Notify commenter for replies
    await sendCommentReplyNotification(parentId, comment._id as string);
  } else {
    await notificationService.notifyAdmins(
      "You have a new comment on your track.",
      "TRACK_COMMENTED",
      comment._id as string,
    );
  }

  return comment;
};

/* Get comment and replies */
export interface populatedComment extends Omit<CommentInterface, "userId"> {
  _id: Types.ObjectId;
  userId: {
    _id: string;
    isVerified: string;
    avatar: string;
  };
  replies?: populatedComment[];
}

function addProfilePictures(
  comment: populatedComment,
  profiles: Map<string, any>,
): void {
  // add user picture so it will be display with user details
  const profile: UserProfile = profiles.get(comment.userId._id.toString());

  comment.userId.avatar = profile?.avatar || "";
  if (comment.replies)
    comment.replies.forEach((reply) => {
      addProfilePictures(reply, profiles);
    });
}

async function getCommentsAndProfilesMap(trackId: string) {
  // build comments map for easy look up by key
  let comments = await Comment.find({ trackId: trackId })
    .populate("userId", "_id username isVerified")
    .lean<populatedComment[]>();

  const userIds = comments.map((comment) => comment.userId._id);

  const commentsMap = new Map<string, any>();
  comments.forEach((comment) => {
    comment.replies = [];
    commentsMap.set(comment._id.toString(), comment);
  });

  // build profiles map for easy look up by key
  const userProfiles = await Profile.find({
    userId: { $in: userIds },
  }).lean();

  const profilesMap = new Map<string, any>();
  userProfiles.forEach((profile) => {
    profilesMap.set(profile.userId.toString(), profile);
  });

  return { commentsMap, profilesMap };
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

  const { commentsMap, profilesMap } = await getCommentsAndProfilesMap(trackId);

  const comment: populatedComment = commentsMap.get(commentId);
  if (!comment)
    throw new AppError(
      ErrorCodes.COMMENT_NOT_FOUND,
      "Comment not found.",
      404,
      true,
      null,
    );

  // build tree to link comment with their replies
  commentsMap.forEach((comment) => {
    if (comment.parentId) {
      const parentComment = commentsMap.get(comment.parentId.toString());
      parentComment.replies.push(comment);
    }
  });

  addProfilePictures(comment, profilesMap);
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

  const rootComments: populatedComment[] = [];
  const { commentsMap, profilesMap } = await getCommentsAndProfilesMap(id);

  // build tree to link comment with their replies
  commentsMap.forEach((comment) => {
    if (comment.parentId) {
      const parentComment = commentsMap.get(comment.parentId.toString());
      parentComment.replies.push(comment);
    } else {
      rootComments.push(comment);
    }
  });

  rootComments.forEach((comment) => addProfilePictures(comment, profilesMap));
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

  const { commentsMap, profilesMap } = await getCommentsAndProfilesMap(trackId);

  // build tree to link comment with their replies
  commentsMap.forEach((comment) => {
    if (comment.parentId) {
      const parentComment = commentsMap.get(comment.parentId.toString());
      parentComment.replies.push(comment);
    }
  });

  const comment = commentsMap.get(updatedComment._id.toString());

  addProfilePictures(comment, profilesMap);
  return comment;
};

/* Delete a comment */
export const deleteComment = async (
  commentId: string,
  id: string,
  userId: string,
): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    await Comment.deleteOne({
      _id: commentId,
      trackId: id,
      userId,
    }).session(session);

    await Comment.deleteMany({
      parentId: commentId,
      trackId: id,
      userId,
    }).session(session);
    //
  } finally {
    session.endSession();
  }
};

/* Like comment */
export const likeComment = async (
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

      if (newCommentLike) {
        await notificationService.postNewNotification(
          userId,
          "Someone liked your comment on a track",
          NotificationType.COMMENT_LIKED,
          newCommentLike._id as string,
        );
      }

      likesCount = updatedComment.likes;
    });

    return { likesCount };
  } catch (error: any) {
    if (error.code === 11000)
      throw new AppError(
        ErrorCodes.COMMENT_ALREADY_LIKED,
        "You already liked this comment",
        400,
        true,
        null,
      );

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
