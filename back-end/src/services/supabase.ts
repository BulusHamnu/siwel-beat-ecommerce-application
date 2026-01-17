import AppError from "../errors/appError.js";
import logger from "../utils/logger.js";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import env from "../configs/env.js";
import type {
  FileUrlInterface,
  LicenseInterface,
} from "../models/track.schema.js";
import { fileTypeFromBuffer } from "file-type";
import { type multerTrackFiles } from "../middlewares/upload.js";

type UndefinedFields<T> = {
  [K in keyof T]: T[K] | undefined;
};
export interface uploadedTrackFiles {
  fileUrl?: UndefinedFields<FileUrlInterface>;
  license?: UndefinedFields<LicenseInterface>;
  coverImageUrl?: string | undefined;
  coverImagePath?: string | undefined;
}

class Supabase {
  client: SupabaseClient["storage"];

  constructor() {
    this.client = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY
    ).storage;
  }

  // methods
  getFileName = (originalname: string): string => {
    let newFileName = originalname.split(".")[0]!;
    newFileName = newFileName.replace(/[^\w.-]/g, "-");
    newFileName = Date.now() + "-" + newFileName;
    return newFileName;
  };

  // upload file to supabase storage
  uploadFile = async (
    bucket: string,
    fileName: string,
    folder: string = "/",
    buffer: Buffer
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
        throw new AppError(`Invalid file name for "${fileName}"`, 400, true);
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
        "An error occurred while downloading file.",
        500,
        false
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
    filesPath: string[]
  ): Promise<boolean> => {
    const { data, error } = await this.client.from(bucket).remove(filesPath);
    if (error) {
      logger.error("An error occurred while deleting files.", error);
      throw new AppError("An error occurred while deleting filse.", 500, false);
    }
    logger.info("Files deleted successfully.");
    return true;
  };

  // function for uploading files
  uploadTrackFiles = async (
    files: multerTrackFiles
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
              env.TRACK_COVER_IMAGE_FOLDER, //
              files.coverImage[0]!.buffer
            )
          : Promise.resolve(undefined),
        // taggedBeat
        files.taggedAudio?.length > 0
          ? this.uploadFile(
              env.AUDIO_FILES_BUCKET,
              files.taggedAudio[0]!.originalname,
              env.TAGGED_AUDIO_FOLDER, //
              files.taggedAudio[0]!.buffer
            )
          : Promise.resolve(undefined),
        // untaggedBeat
        files.untaggedAudio?.length > 0
          ? this.uploadFile(
              env.AUDIO_FILES_BUCKET,
              files.untaggedAudio[0]!.originalname,
              env.UNTAGGED_AUDIO_FOLDER,
              files.untaggedAudio[0]!.buffer
            )
          : Promise.resolve(undefined),
        // basicLicense
        files.basicLicense?.length > 0
          ? this.uploadFile(
              env.DOCUMENT_FILES_BUCKET,
              files.basicLicense[0]!.originalname,
              env.BASIC_LICENSE_FOLDER,
              files.basicLicense[0]!.buffer
            )
          : Promise.resolve(undefined),
        // premiumLicense
        files.premiumLicense?.length > 0
          ? this.uploadFile(
              env.DOCUMENT_FILES_BUCKET,
              files.premiumLicense[0]!.originalname,
              env.PREMIUM_LICENSE_FOLDER,
              files.premiumLicense[0]!.buffer
            )
          : Promise.resolve(undefined),
      ]);

      let coverImgPublicUrl: string | undefined = undefined;
      if (coverImage) {
        paths.push(coverImage); // the coverImagePath is save so we can delete and update the cover image later.
        coverImgPublicUrl = await this.getPublicUrl(
          env.IMAGE_FILES_BUCKET,
          coverImage
        ); // Save public as well so user can view it.
      }
      if (tagged) paths.push(tagged);
      if (untagged) paths.push(untagged);
      if (basic) paths.push(basic);
      if (premium) paths.push(premium);

      return {
        coverImageUrl: coverImgPublicUrl,
        coverImagePath: coverImage,
        fileUrl: {
          tagged,
          untagged,
        },
        license: {
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
        path.startsWith(env.TAGGED_AUDIO_FOLDER) ||
        path.startsWith(env.UNTAGGED_AUDIO_FOLDER)
    );
    const licensePaths = paths.filter(
      (path) =>
        path.startsWith(env.BASIC_LICENSE_FOLDER) ||
        path.startsWith(env.PREMIUM_LICENSE_FOLDER)
    );
    const coverImagePaths = paths.filter((path) =>
      path.startsWith(env.TRACK_COVER_IMAGE_FOLDER)
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
