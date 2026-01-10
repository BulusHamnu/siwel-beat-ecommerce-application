// userbody types
export interface CreateUserBody {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  gender?: string;
  provider: string;
  role: string;
  isVerified: boolean;
  googleId: string;
  idToken: string;
  accessToken: string;
  picture: string;
}

export interface UserProfile {
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
  profilePic: string;
  createdAt: Date;
  updatedAt: Date;
  notification: {
    emailNotification: {
      commentAndLikes: boolean;
    };
  };
}
