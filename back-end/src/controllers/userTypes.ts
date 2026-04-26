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
  accessToken: string;
  avatar: string;
}
