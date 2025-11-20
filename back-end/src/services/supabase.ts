import AppError from "../errors/appError.js";
import logger from "../utils/logger.js";
import { createClient } from "@supabase/supabase-js";
import env from "../configs/env.js";
import type {
  FileUrlInterface,
  LicenseInterface,
} from "../models/track.schema.js";
import { fileTypeFromBuffer } from "file-type";

interface uploadedFilesPaths {
  fileUrl: FileUrlInterface;
  license: LicenseInterface;
}

class Supabase {
  client: any;

  constructor() {
    this.client = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY
    ).storage;
  }

  // methods
  getFileName = (originalname: string): string => {
    const name_g = originalname.replace(/ /g, "-");
    let name = Date.now() + "-" + name_g;
    return name;
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

    const { data, error } = await this.client
      .from(bucket)
      .upload(filePath, buffer, { contentType: mimeResult?.mime });

    if (error) {
      if (error.stack?.includes("Invalid key")) {
        throw new AppError(`Invalid file name for "${fileName}"`, 400, true);
      } else {
        throw error;
      }
    }
    logger.info("File uploaded to supabase sucessfully.");
    return data.path;
  };

  // download file from supabase storage
  downloadFile = async (bucket: string, fileName: string): Promise<Buffer> => {
    const { data, error } = await this.client.from(bucket).download(fileName);

    if (error) {
      logger.error("An error occur while downloading file to supabase.", error);
      throw new AppError(
        "An error occur while downloading file to supabase.",
        500,
        false
      );
    }
    // change file blob to buffer
    const buffer = Buffer.from(new Uint8Array(await data.arrayBuffer()));
    logger.info("File downloaded from supabase sucessfully.");
    return buffer;
  };

  // deletes list of files in supabase storage
  deleteFiles = async (bucket: string, files: string[]): Promise<boolean> => {
    const { data, error } = await this.client.from(bucket).remove(files);

    if (error) {
      logger.error("An error occur while downloading file to supabase.", error);
      throw new AppError(
        "An error occur while deleting file to supabase.",
        500,
        false
      );
    }
    logger.info("Files deleted from supabase sucessfully.");
    return true;
  };

  // function for uploading files
  uploadTrackFiles = async (files: any): Promise<uploadedFilesPaths> => {
    const paths: string[] = [];
    let tagged: string = "";
    let untagged: string = "";
    let basicLicense: string = "";
    let premiumLicense: string = "";

    try {
      if (files.taggedBeat?.length > 0) {
        tagged = await supabase.uploadFile(
          "audios",
          files.taggedBeat[0].originalname,
          `taggedBeat/`,
          files.taggedBeat[0].buffer
        );
        paths.push(tagged);
      }

      if (files.untaggedBeat?.length > 0) {
        untagged = await supabase.uploadFile(
          "audios",
          files.untaggedBeat[0].originalname,
          `untaggedBeat/`,
          files.untaggedBeat[0].buffer
        );
        paths.push(untagged);
      }

      if (files.basicLicense?.length > 0) {
        basicLicense = await supabase.uploadFile(
          "documents",
          files.basicLicense[0].originalname,
          `basicLicense/`,
          files.basicLicense[0].buffer
        );
        paths.push(basicLicense);
      }

      if (files.premiumLicense?.length > 0) {
        premiumLicense = await supabase.uploadFile(
          "documents",
          files.premiumLicense[0].originalname,
          `premiumLicense/`,
          files.premiumLicense[0].buffer
        );
        paths.push(premiumLicense);
      }

      return {
        fileUrl: {
          tagged,
          untagged,
        },
        license: {
          basic: basicLicense,
          premium: premiumLicense,
        },
      };
    } catch (error) {
      await this.safeRemoveTrackFiles(paths); // clean files
      throw error;
    }
  };

  // safe delete files fucntion
  safeRemoveTrackFiles = async (paths: string[]): Promise<boolean> => {
    const audioPaths = paths.filter(
      (path) =>
        path.startsWith("taggedBeat/") || path.startsWith("untaggedBeat/")
    );
    const licensePaths = paths.filter(
      (path) =>
        path.startsWith("basicLicense/") || path.startsWith("premiumLicense/")
    );

    if (audioPaths?.length > 0) {
      await this.deleteFiles("audios", audioPaths);
    }
    if (licensePaths?.length > 0) {
      await this.deleteFiles("documents", licensePaths);
    }
    return true;
  };
}

const supabase = new Supabase();
export default supabase;
