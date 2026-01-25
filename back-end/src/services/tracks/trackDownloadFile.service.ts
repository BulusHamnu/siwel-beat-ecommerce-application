import AppError, { ErrorCodes } from "../../errors/appError.js";
import Purchase, {
  type PurchaseInterface,
} from "../../models/purchase.schema.js";
import Track, { type TrackInterface } from "../../models/track.schema.js";
import { type userPayload } from "../../middlewares/withAuth.js";
import path from "path";

/* Get track file for download */
async function checkForPurchase(
  role: string,
  userId: string,
  licenseType: string,
  trackId: string,
): Promise<boolean> {
  if (role === "admin") return true;
  let purchasedTrack: PurchaseInterface | null = await Purchase.findOne({
    trackId,
    userId,
    type: licenseType,
  });

  if (!purchasedTrack)
    throw new AppError(
      ErrorCodes.PURCHASE_NOT_FOUND,
      "Unable to download license, no purchase found.",
      404,
      true,
      null,
    );

  return true;
}

async function transformNameAndPath(
  requestFile: string,
  licenseType: string,
  track: TrackInterface,
) {
  let filePath: string = "";
  let fileName = track.title.replace(" ", "_");

  if (requestFile === "license") {
    if (licenseType === "premium") {
      filePath = track.license.premium;
    } else {
      filePath = track.license.basic;
    }
    fileName =
      fileName + "_" + `${licenseType}_license` + path.extname(filePath);
  } else if (requestFile === "audio") {
    filePath = track.fileUrl.untagged;
    fileName = fileName + "_" + `untagged_audio` + path.extname(filePath);
  } else {
    throw new AppError(
      ErrorCodes.DOWNLOAD_FILE_TYPE_INVALID,
      "Unsupported file type",
      400,
      true,
      {
        requestedFile: requestFile,
      },
    );
  }

  return { filePath, fileName };
}

export const retriveTrackFilePaths = async (
  user: userPayload,
  trackId: string,
  licenseType: string,
  requestFile: string,
): Promise<{ fileName: string; filePath: string }> => {
  const track: TrackInterface | null = await Track.findOne({ _id: trackId });
  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found.",
      404,
      true,
      null,
    );

  await checkForPurchase(user.role, user.id, licenseType, trackId);
  const { fileName, filePath } = await transformNameAndPath(
    requestFile,
    licenseType,
    track,
  );

  return { fileName, filePath };
};
