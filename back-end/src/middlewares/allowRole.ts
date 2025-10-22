import type { Response, Request, NextFunction } from "express";
import AppError from "../errors/appError.js";

const allowRole = (...roles: string[]): any => {
  // return role checking middleware
  return async (
    req: Request<{}, {}, {}, {}>,
    res: Response<{}>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userRole: string | undefined = req.user?.role;
      if (!userRole || !roles.includes(userRole))
        throw new AppError("Not allowed", 403, true);

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default allowRole;
