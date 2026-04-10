import axios from "axios";
const googleCallbackUrl = "https://oauth2.googleapis.com/token";
import qs from "qs";
import env from "../configs/env.js";
import {
  OAuth2Client,
  type TokenPayload,
  type Credentials,
} from "google-auth-library";
("google-auth-library");
const oauth = new OAuth2Client(env.GOOGLE_CLIENT_ID);
import { generateRandCode } from "../utils/helpers.js";
import logger from "../utils/logger.js";

export interface userGooglePayload extends Omit<
  TokenPayload,
  "iss" | "sub" | "iat" | "aud" | "exp"
> {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender?: string;
  provider: string;
  isVerified: boolean;
  role: string;
  avatar: string;
  accessToken: string;
  googleId: string;
}

/* Verify google user */
async function retriveGoogleCredentials(
  code: string | number,
): Promise<{ credentials: Credentials }> {
  const response = await axios.post(
    googleCallbackUrl,
    qs.stringify({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: env.GOOGLE_REDIRECT_URL,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return { credentials: response.data };
}

const retriveGoogleUserPayload = async (
  code: string,
): Promise<userGooglePayload> => {
  const { credentials } = await retriveGoogleCredentials(code);

  const ticket = await oauth.verifyIdToken({
    idToken: credentials.id_token!,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload()!;
  if (!payload) throw new Error("Failed to retrive google payload.");

  logger.info("Google idToken verify successfully: ", {
    email: payload.email,
    googleId: payload.sub,
  });

  return {
    username: payload.name!.toLowerCase().replace(" ", "_"),
    firstName: payload.given_name!,
    lastName: payload.family_name!,
    email: payload.email!,
    password: payload.given_name! + `${generateRandCode(10)}`,
    provider: "google",
    isVerified: payload.email_verified!,
    role: "user",
    avatar: payload.picture!,
    accessToken: credentials.access_token!,
    googleId: payload.sub!,
  };
};

export default retriveGoogleUserPayload;
