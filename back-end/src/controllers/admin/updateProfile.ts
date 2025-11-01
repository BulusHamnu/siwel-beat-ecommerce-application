import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import type { UserDocument } from "../../models/userShema.js";
import AppError from "../../errors/appError.js";
import User from "../../models/userShema.js";

interface updateBody {
  firstname: string;
  username: string;
  lastname: string;
}

const updateAdminProfileController = async (
  req: Request<{}, ApiResponse<UserDocument>, updateBody, {}>,
  res: Response<ApiResponse<UserDocument>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const allowFields = ["username", "firstName", "lastName"];
    const updates: updateBody = req.body;

    for (const key of Object.keys(updates) as (keyof updateBody)[]) {
      if (!allowFields.includes(key)) delete updates[key];
    }

    const user: UserDocument | null = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: updates },
      { new: true }
    );
    if (!user) throw new AppError("User does not exist.", 404, true);

    const response: ApiResponse<UserDocument> = {
      status: true,
      message: "Admin profile updated succefully.",
      data: user.removeUnwantedField(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default updateAdminProfileController;
