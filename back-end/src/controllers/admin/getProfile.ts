import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import type { UserDocument } from "../../models/userShema.js";
import AppError from "../../errors/appError.js";
import User from "../../models/userShema.js";

const getAdminProfileController = async (
  req: Request<{}, ApiResponse<UserDocument>, {}, {}>,
  res: Response<ApiResponse<UserDocument>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const user: UserDocument | null = await User.findOne({ _id: userId });
    if (!user) throw new AppError("User does not exist.", 404, true);

    const response: ApiResponse<UserDocument> = {
      status: true,
      message: "Admin profile retrived sucessfully.",
      data: user.removeUnwantedField(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default getAdminProfileController;
