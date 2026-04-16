import type { Response, Request, NextFunction } from "express";
import AppError, { ErrorCodes } from "../errors/appError.js";

const allowRole = (...roles: string[]): any => {
  return async (
    req: Request<{}, {}, {}, {}>,
    res: Response<{}>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userRole: string | undefined = req.user?.role;
      if (!userRole || !roles.includes(userRole))
        throw new AppError(
          ErrorCodes.ROLE_NOT_ALLOWED,
          "Not allowed",
          403,
          true,
          {
            role: userRole,
          },
        );

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default allowRole;
