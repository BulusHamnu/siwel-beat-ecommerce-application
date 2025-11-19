import AppError from "../errors/appError.js";
import logger from "../utils/logger.js";
import { createClient } from "@supabase/supabase-js";
import env from "../configs/env.js";

class Supabase {
  client: any;

  constructor() {
    this.client = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY
    ).storage;
  }

  // methods
  // upload file to supabase storage
  uploadFile = async (
    bucket: string,
    fileName: string,
    fileData: Buffer
  ): Promise<string> => {
    const { data, error } = await this.client
      .from(bucket)
      .upload(fileName, fileData);

    if (error) {
      logger.error("An error occur while uploading file to supabase.", error);
      throw new AppError(
        "An error occur while uploading file to supabase.",
        500,
        false
      );
    }
    return data.fullPath;
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
    return buffer;
  };

  // deletes list of files in supabase storage
  deleteFiles = async (bucket: string, files: string[]): Promise<boolean> => {
    const { data, error } = await this.client.from(bucket).remove(files);

    if (error) {
      logger.error("An error occur while downloading file to supabase.", error);
      throw new AppError(
        "An error occur while downloading file to supabase.",
        500,
        false
      );
    }
    return true;
  };
}

const supabase = new Supabase();
export default supabase;
// console.log(await supabase.downloadFile("documents", "basic-license/pirated.pdf"));
// console.log(
//   await supabase.uploadFile("documents", "basic-license/pirated.pdf", d)
// );
// console.log(await supabase.deleteFiles("documents", ["basic-license/pirated.pdf"]));
