import AppError, { ErrorCodes } from "../errors/appError.js";
import logger from "../utils/logger.js";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import env from "../configs/env.js";
import { fileTypeFromBuffer } from "file-type";
import { type MulterTrackFiles } from "../middlewares/upload.js";
import crypto from "crypto";

export interface AudioInput {
  tagged?: string | undefined;
  untagged?: string | undefined;
}

export interface LicenseInput {
  basic?: string | undefined;
  premium?: string | undefined;
}

export interface uploadedTrackFiles {
  audioUrl?: AudioInput;
  licenseUrl?: LicenseInput;
  coverImageUrl?: string | undefined;
  coverImagePath?: string | undefined;
}

class Supabase {
  client: SupabaseClient["storage"];

  constructor() {
    this.client = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY,
    ).storage;
  }

  // methods
  getFileName = (originalname: string): string => {
    const randString = crypto.randomBytes(16).toString("hex");

    let newFileName = originalname.replace(/[^\w.-]/g, "-");
    newFileName = randString + "-" + newFileName;

    return newFileName;
  };

  // upload file to supabase storage
  uploadFile = async (
    bucket: string,
    fileName: string,
    folder: string = "/",
    buffer: Buffer,
  ): Promise<string> => {
    const name = this.getFileName(fileName);
    const filePath = folder + name;
    const mimeResult = await fileTypeFromBuffer(buffer);
    const contentType = mimeResult
      ? mimeResult.mime
      : "application/octet-stream";

    const { data, error } = await this.client
      .from(bucket)
      .upload(filePath, buffer, {
        contentType,
      });

    if (error) {
      if (error.stack?.includes("Invalid key")) {
        throw new AppError(
          ErrorCodes.FILE_NAME_INVALID,
          `Invalid name, please try renaming the file. `,
          400,
          true,
          { filename: fileName },
        );
      } else {
        throw error;
      }
    }

    logger.info("File uploaded successfully.");
    return data.path;
  };

  // get public url of a resource
  getPublicUrl = async (bucket: string, filePath: string): Promise<string> => {
    const { data } = this.client.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  // download file from supabase storage
  downloadFile = async (bucket: string, fileName: string): Promise<Buffer> => {
    const { data, error } = await this.client.from(bucket).download(fileName);

    if (error) {
      logger.error("An error occurred while downloading file.", error);
      throw new AppError(
        ErrorCodes.SUPABASE_DOWNLOAD_ERROR,
        "An error occurred while downloading file.",
        500,
        false,
        null,
      );
    }

    // change file blob to buffer so we can save to disk
    const buffer = Buffer.from(new Uint8Array(await data.arrayBuffer()));
    logger.info("File downloaded sucessfully.");
    return buffer;
  };

  // deletes list of files in supabase storage
  deleteFiles = async (
    bucket: string,
    filesPath: string[],
  ): Promise<boolean> => {
    const { data, error } = await this.client.from(bucket).remove(filesPath);
    if (error) {
      logger.error("An error occurred while deleting files.", error);
      throw new AppError(
        ErrorCodes.SUPABASE_DELETION_ERROR,
        "An error occurred while deleting filse.",
        500,
        false,
        null,
      );
    }

    logger.info("Files deleted successfully.");
    return true;
  };

  // function for uploading files
  uploadTrackFiles = async (
    files: MulterTrackFiles,
  ): Promise<uploadedTrackFiles> => {
    const paths: string[] = [];

    try {
      if (Object.keys(files).length <= 0) return {};

      const [coverImage, tagged, untagged, basic, premium] = await Promise.all([
        // coverImage
        files.coverImage?.length > 0
          ? this.uploadFile(
              env.IMAGE_FILES_BUCKET,
              files.coverImage[0]!.originalname,
              "cover-images/", //
              files.coverImage[0]!.buffer,
            )
          : Promise.resolve(undefined),
        // taggedBeat
        files.taggedAudio?.length > 0
          ? this.uploadFile(
              env.AUDIO_FILES_BUCKET,
              files.taggedAudio[0]!.originalname,
              "tagged-audios/", //
              files.taggedAudio[0]!.buffer,
            )
          : Promise.resolve(undefined),
        // untaggedBeat
        files.untaggedAudio?.length > 0
          ? this.uploadFile(
              env.AUDIO_FILES_BUCKET,
              files.untaggedAudio[0]!.originalname,
              "untagged-audios/",
              files.untaggedAudio[0]!.buffer,
            )
          : Promise.resolve(undefined),
        // basicLicense
        files.basicLicense?.length > 0
          ? this.uploadFile(
              env.DOCUMENT_FILES_BUCKET,
              files.basicLicense[0]!.originalname,
              "basic-licenses/",
              files.basicLicense[0]!.buffer,
            )
          : Promise.resolve(undefined),
        // premiumLicense
        files.premiumLicense?.length > 0
          ? this.uploadFile(
              env.DOCUMENT_FILES_BUCKET,
              files.premiumLicense[0]!.originalname,
              "premium-licenses/",
              files.premiumLicense[0]!.buffer,
            )
          : Promise.resolve(undefined),
      ]);

      let coverImgPublicUrl: string | undefined = undefined;
      if (coverImage) {
        paths.push(coverImage); // the coverImagePath is save so we can delete and update the cover image later.
        coverImgPublicUrl = await this.getPublicUrl(
          env.IMAGE_FILES_BUCKET,
          coverImage,
        ); // Save public as well so user can view it.
      }
      if (tagged) paths.push(tagged);
      if (untagged) paths.push(untagged);
      if (basic) paths.push(basic);
      if (premium) paths.push(premium);

      return {
        coverImageUrl: coverImgPublicUrl,
        coverImagePath: coverImage,
        audioUrl: {
          tagged,
          untagged,
        },
        licenseUrl: {
          basic,
          premium,
        },
      };
    } catch (error) {
      await this.safeRemoveTrackFiles(paths); // delete files
      throw error;
    }
  };

  // Safe delete files fucntion
  safeRemoveTrackFiles = async (paths: string[]): Promise<void> => {
    const audioPaths = paths.filter(
      (path) =>
        path.startsWith("tagged-audios/") ||
        path.startsWith("untagged-audios/"),
    );

    const licensePaths = paths.filter(
      (path) =>
        path.startsWith("basic-licenses/") ||
        path.startsWith("premium-licenses/"),
    );

    const coverImagePaths = paths.filter((path) =>
      path.startsWith("cover-images/"),
    );

    const requests: Promise<boolean>[] = [];
    if (audioPaths?.length > 0) {
      requests.push(this.deleteFiles(env.AUDIO_FILES_BUCKET, audioPaths));
    }
    if (licensePaths?.length > 0) {
      requests.push(this.deleteFiles(env.DOCUMENT_FILES_BUCKET, licensePaths));
    }
    if (coverImagePaths?.length > 0) {
      requests.push(this.deleteFiles(env.IMAGE_FILES_BUCKET, coverImagePaths));
    }

    await Promise.all(requests);
    logger.info("Track files deleted successfully.");
  };
}

const supabase = new Supabase();
export default supabase;
