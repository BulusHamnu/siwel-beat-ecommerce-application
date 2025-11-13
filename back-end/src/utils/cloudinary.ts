import { v2 as cloudinary } from "cloudinary";
import env from "../configs/env.js";
import logger from "./logger.js";
import path from "path";
import AppError from "../errors/appError.js";

export const deleteFilesInCloudinary = (files: any): void => {
  for (const field of Object.keys(files)) {
    files[field].forEach((file: any) => {
      cloudinary.uploader.destroy(
        file.path,
        { resource_type: "raw" },
        (error, result) => {
          error
            ? logger.error(error)
            : logger.info("Uploaded files deleted from cloudinary");
        }
      );
    });
  }
};

// Cloudinary Config
cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_SECRET,
});

const uploadBuffer = async (
  fileBuffer: Buffer,
  originalname: string,
  folder: string
): Promise<string> => {
  const name = originalname.split(".")[0]?.replace(/ /g, "-");
  const fileName = name + "-" + Date.now() + path.extname(originalname);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", folder: folder, public_id: fileName },
        (err, result) => {
          if (err) {
            return reject(err.message);
          }

          if (!result || !result.secure_url) {
            return reject(
              new AppError(
                "Cloudinary upload failed, no result returned",
                500,
                false
              )
            );
          }

          logger.info(`File buffer for ${fileName} is processed successfully.`);
          resolve(result.secure_url);
        }
      )
      .end(fileBuffer);
  });
};
export default uploadBuffer;
