import type { Response, Request, NextFunction } from "express";
import env from "../../configs/env.js";
import type { ApiResponse } from "../apiTypes.js";
import logger from "../../utils/logger.js";
import { setRedirect } from "../../utils/helpers.js"

const getGoogleOauthUrlController = async (
  req: Request<
    {},
    {
      status: boolean;
      message: string;
      data?: { url: string };
    },
    {},
    {}
  >,
  res: Response<{
    status: boolean;
    message: string;
    data?: { url: string };
  }>,
  next: NextFunction
): Promise<void> => {
  try {
    const googleOauthUrl = "https://accounts.google.com/o/oauth2/v2/auth?";
    const path = req.path;

    const redirectUri = setRedirect(path.split("/")[3])

    const params = new URLSearchParams({
      client_id: env.CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      prompt: "consent",
    });

    const url = googleOauthUrl + params.toString();
    const response: ApiResponse<{ url: string }> = {
      status: true,
      message: "Google oauth2 url retrived successfully.",
      data: {
        url,
      },
    };
    logger.info(`Google Oauth prompt url requested for: ${path.split("/")[3]}`);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default getGoogleOauthUrlController;
