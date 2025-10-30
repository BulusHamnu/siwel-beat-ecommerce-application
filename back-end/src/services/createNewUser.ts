import User from "../models/userShema.js";
import type { createUserBody } from "../controllers/auths/userTypes.js";
import type { UserDocument } from "../models/userShema.js";
import AppError from "../errors/appError.js";
import { createHashpasswordAndEmailVerification } from "../utils/helpers.js";
import Profile, { type ProfileDocument } from "../models/profileSchema.js";

const createNewUser = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  provider,
  isVerified,
  role,
  picture,
  accessToken,
  idToken,
  googleId,
}: createUserBody): Promise<UserDocument> => {
  // check if user already exist
  const emailExist = await User.findOne({ email: email });
  if (emailExist) {
    throw new AppError("User already exist!", 209, true);
  }

  // hash user password
  const { hashPassword, emailVerification } =
    await createHashpasswordAndEmailVerification(password, 15);

  const user = await User.create({
    emailVerification: isVerified == true ? {} : emailVerification,
    username,
    email,
    provider,
    role,
    isVerified,
    password: hashPassword,
    google: {
      googleId,
      idToken,
      accessToken,
    },
  });

  // create user profile
  const profile = await Profile.create({
    userId: user._id,
    firstName,
    lastName,
    profilePic: picture,
  });

  return user;
};

export default createNewUser;
