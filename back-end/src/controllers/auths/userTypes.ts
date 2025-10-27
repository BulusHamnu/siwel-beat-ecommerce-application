import type { cartInterface } from "../../models/profileSchema.js";

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
  carts: cartInterface[];
  profilePic: string;
  createdAt: Date;
  updatedAt: Date;
  notification: {
    emailNotification: {
      commentAndLikes: boolean;
    };
  };
}
