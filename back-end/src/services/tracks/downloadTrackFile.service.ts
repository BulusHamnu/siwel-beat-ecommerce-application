import AppError, { ErrorCodes } from "../../errors/appError.js";
import Track, { type TrackInterface } from "../../models/track.schema.js";
import { type userPayload } from "../../middlewares/requiredAuth.js";
import path from "path";
import Audio, { type AudioInterface } from "../../models/audio.schema.js";
import License, { type LicenseInterface } from "../../models/license.schema.js";
import env from "../../configs/env.js";
import supabase from "../supabase.js";
import logger from "../../utils/logger.js";
import { checkForPurchase } from "../users/userPurchases.service.js";

/* Get track file for download */
async function transformNameAndRetrieveFilePath(
  requestedFile: string,
  licenseType: string,
  track: TrackInterface,
) {
  let filePath: string = "";
  let fileName = track.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  switch (requestedFile) {
    case "audio": {
      const audio = await Audio.findOne({
        trackId: track._id,
      }).lean<AudioInterface>();

      if (!audio)
        throw new AppError(
          ErrorCodes.MEDIA_NOT_FOUND,
          "No audio files have been uploaded for this track.",
          500,
          false,
          null,
        );

      filePath = audio.untagged;
      fileName = fileName + "-" + `untagged-audio` + path.extname(filePath);

      return { filePath, fileName };
    }

    case "license": {
      const license = await License.findOne({
        trackId: track._id,
      }).lean<LicenseInterface>();

      if (!license)
        throw new AppError(
          ErrorCodes.MEDIA_NOT_FOUND,
          "No license files have been uploaded for this track.",
          500,
          false,
          null,
        );

      if (licenseType === "premium") {
        filePath = license.premium;
      } else {
        filePath = license.basic;
      }

      fileName =
        fileName + "-" + `${licenseType}-license` + path.extname(filePath);

      return { filePath, fileName };
    }

    default: {
      throw new AppError(
        ErrorCodes.DOWNLOAD_FILE_TYPE_INVALID,
        "Unsupported file type",
        400,
        true,
        {
          requestedFile,
        },
      );
    }
  }
}

export const retrieveTrackFileForDownload = async ({
  user,
  trackId,
  licenseType,
  requestedFile,
}: {
  user: userPayload;
  trackId: string;
  licenseType: string;
  requestedFile: string;
}): Promise<{ url: string }> => {
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

  const { fileName, filePath } = await transformNameAndRetrieveFilePath(
    requestedFile,
    licenseType,
    track,
  );

  let bucket =
    requestedFile === "license"
      ? env.DOCUMENT_FILES_BUCKET
      : env.AUDIO_FILES_BUCKET;

  const { data, error } = await supabase.client
    .from(bucket)
    .createSignedUrl(filePath, 60, {
      download: fileName,
    });

  if (error) {
    logger.error("An error occur while downloading file.", error);
    throw new AppError(
      ErrorCodes.TRACK_DOWNLOAD_ERROR,
      "Download error.",
      500,
      true,
      null,
    );
  }

  return { url: data.signedUrl };
};
