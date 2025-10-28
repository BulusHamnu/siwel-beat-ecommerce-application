import axios from "axios";
const googleCallbackUrl = "https://oauth2.googleapis.com/token";
import qs from "qs";
import env from "../configs/env.js";
import { OAuth2Client } from "google-auth-library";
("google-auth-library");
const oauth = new OAuth2Client(env.CLIENT_ID);
import { generateRandCode, setRedirect } from "../utils/helpers.js";
import logger from "../utils/logger.js";

export interface userPayloadInterface {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  provider: string;
  isVerified: boolean;
  role: string;
  picture: string;
  accessToken: string;
  idToken: string;
  googleId: string;
}

const retriveGoogleUserPayload = async (
  code: string,
  route: string
): Promise<userPayloadInterface> => {
  const redirectUri = setRedirect(route);

  const response = await axios.post(
    googleCallbackUrl,
    qs.stringify({
      code,
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const ticket = await oauth.verifyIdToken({
    idToken: response.data.id_token,
    audience: env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  logger.info("Google idToken verify successfully: ", {
    email: payload?.email,
    googleId: payload?.sub,
  });

  return {
    username: payload?.name || "",
    firstName: payload?.given_name || "",
    lastName: payload?.family_name || "",
    email: payload?.email || "",
    password: (payload?.given_name || "") + `${generateRandCode(10)}`,
    provider: "google",
    isVerified: payload?.email_verified || false,
    role: "user",
    picture: payload?.picture || "",
    idToken: response.data.id_token || "",
    accessToken: response.data.access_token,
    googleId: payload?.sub || "",
  };
};

export default retriveGoogleUserPayload;
