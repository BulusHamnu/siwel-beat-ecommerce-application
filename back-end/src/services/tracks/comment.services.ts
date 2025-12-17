import Comment, { type CommentInterface } from "../../models/comment.schema.js";
import { type FlattenMaps, type ObjectId } from "mongoose";
import { postNewNotification, notifyAdmins } from "../notification.services.js";
import Track from "../../models/track.schema.js";
import AppError from "../../errors/appError.js";
import Profile, { type ProfileDocument } from "../../models/profile.schema.js";

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
  entityId: string
): Promise<void> {
  const parentComment = (await Comment.findOne({ _id: parentId }).populate(
    "userId",
    "username email _id"
  )) as parentComment | null;

  if (!parentComment) return;

  await postNewNotification(
    parentComment?.userId._id!,
    `${parentComment?.userId.username} replied to your comment.`,
    "COMMENT_REPLIED",
    entityId
  );
}

export const postNewComment = async (
  trackId: string,
  userId: string,
  { parentId, content }: CommentInterface
): Promise<CommentInterface> => {
  const track = await Track.findOne({ _id: trackId });
  if (!track) throw new AppError("Track not found.", 404, true);

  const comment = await Comment.create({ content, parentId, trackId, userId });
  if (parentId) {
    // Notify commenter for replies
    await sendCommentReplyNotification(parentId, comment._id as string);
  } else {
    await notifyAdmins(
      "You have a new comment on your track.",
      "TRACK_COMMENTED",
      comment._id as string
    );
  }

  return comment;
};

/* Get comment and replies */
export interface populatedComment extends Omit<CommentInterface, "userId"> {
  userId: {
    _id: string;
    isVerified: string;
    picture: string;
  };
  replies?: populatedComment[];
}

function addProfilePictures(
  comment: populatedComment,
  profiles: Map<string, any>
): void {
  // add user picture so it will be display with user details
  const profile = profiles.get(comment.userId._id.toString());
  comment.userId.picture = profile?.picture || "";
  if (comment.replies)
    comment.replies.forEach((reply) => {
      addProfilePictures(reply, profiles);
    });
}

async function getCommentAndProfilesMap(trackId: string) {
  // build comments map for easy look up by key
  let comments = await Comment.find({ trackId: trackId })
    .populate("userId", "_id username isVerified")
    .lean();

  const userIds = comments.map((comment) => comment.userId._id);

  const commentMap = new Map<string, any>();
  comments.forEach((comment) => {
    comment.replies = [];
    commentMap.set(comment._id.toString(), comment);
  });

  // build profiles map for easy look up by key
  const userProfiles = await Profile.find({
    userId: { $in: userIds },
  }).lean();
  const profilesMap = new Map<string, any>();
  userProfiles.forEach((profile) => {
    profilesMap.set(profile.userId.toString(), profile);
  });

  return { commentMap, profilesMap };
}

export const getCommentAndReplies = async (
  commentId: string,
  trackId: string
): Promise<populatedComment> => {
  const { commentMap, profilesMap } = await getCommentAndProfilesMap(trackId);

  const comment: populatedComment = commentMap.get(commentId);
  if (!comment) throw new AppError("Comment not found.", 404, true);

  // build tree to link comment with their replies
  commentMap.forEach((comment) => {
    if (comment.parentId) {
      const parentComment = commentMap.get(comment.parentId.toString());
      parentComment.replies.push(comment);
    }
  });

  addProfilePictures(comment, profilesMap);
  return comment;
};

/* Get all comment */
export const getAllComments = async (
  id: string
): Promise<populatedComment[]> => {
  const rootComments: populatedComment[] = [];
  const { commentMap, profilesMap } = await getCommentAndProfilesMap(id);

  // build tree to link comment with their replies
  commentMap.forEach((comment) => {
    if (comment.parentId) {
      const parentComment = commentMap.get(comment.parentId.toString());
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
  content: string
): Promise<populatedComment> => {
  const updatedComment = await Comment.findByIdAndUpdate(
    {
      _id: commentId,
      trackId,
      userId,
    },
    { $set: { content } },
    { new: true }
  )
    .populate("userId", "_id username isVerified")
    .lean();

  if (!updatedComment) throw new AppError("Comment not found.", 404, true);

  const comment = await getCommentAndReplies(
    updatedComment._id as string,
    updatedComment.trackId as string
  );

  return comment;
};

/* Delete comment */
export const deleteComment = async (
  commentId: string,
  id: string,
  userId: string
): Promise<void> => {
  await Promise.all([
    Comment.deleteOne({
      _id: commentId,
      trackId: id,
      userId,
    }),
    Comment.deleteMany({
      parentId: commentId,
      trackId: id,
      userId,
    }),
  ]);
};
