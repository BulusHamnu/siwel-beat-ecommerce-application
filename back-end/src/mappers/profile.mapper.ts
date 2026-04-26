import type { UserProfile } from "../services/profile.service.js";

/* User profile mapper */

export interface ProfileResponse extends Omit<UserProfile, "_id"> {}
export function mapUserProfile(profile: UserProfile): UserProfile {
  return {
    id: String(profile.id),
    username: profile.username,
    isVerified: profile.isVerified,
    email: profile.email,
    role: profile.role,
    isActive: profile.isActive,
    avatar: profile.avatar,
    notification: profile.notification,
    firstName: profile.firstName,
    lastName: profile.lastName,
    gender: profile.gender,
    bio: profile.bio,
    createdAt: profile.createdAt,
  };
}
