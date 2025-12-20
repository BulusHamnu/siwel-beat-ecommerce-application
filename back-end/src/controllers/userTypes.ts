import type { CartItem } from "../models/profile.schema.js";

// userbody types
export interface createUserBody {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  provider: string;
  role: string;
  isVerified: boolean;
  googleId: string;
  idToken: string;
  accessToken: string;
  picture: string;
}

export interface userProfile {
  _id: string;
  email: string;
  isVerified: boolean;
  firstName: string;
  lastName: string;
  gender: string;
  bio: string;
  username: string;
  role: string;
  isActive: string;
  cart?: CartItem[];
  profilePic: string;
  createdAt: Date;
  updatedAt: Date;
  notification: {
    emailNotification: {
      commentAndLikes: boolean;
    };
  };
}
