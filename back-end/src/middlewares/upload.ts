import multer, { type Multer } from "multer";
import path from "path";
import fs from "fs";
import env from "../configs/env.js";
import type { Request } from "express";
import AppError from "../errors/appError.js";

type multerFiles = { [fieldname: string]: Express.Multer.File[] };
export interface multerTrackFiles extends multerFiles {
  taggedBeat: Express.Multer.File[];
  untaggedBeat: Express.Multer.File[];
  basicLicense: Express.Multer.File[];
  premiumLicense: Express.Multer.File[];
}

/* On error delete files from disk */
export const deleteFiles = (files: multerFiles) => {
  for (const field of Object.keys(files)) {
    files[field]!.forEach((file: Express.Multer.File) => {
      fs.unlink(file.path, (err) => {
        if (err) throw err;
      });
    });
  }
};

/* Determine destination */
export const determineDest = (fieldName: string): string => {
  let desc = "";

  switch (fieldName) {
    case "basicLicense":
      desc = path.join(env.DIR_NAME, "uploads", "licenses", "basics");
      break;
    case "premiumLicense":
      desc = path.join(env.DIR_NAME, "uploads", "licenses", "premiums");
      break;
    case "untaggedBeat":
      desc = path.join(env.DIR_NAME, "uploads", "beats", "tagged");
      break;
    case "taggedBeat":
      desc = path.join(env.DIR_NAME, "uploads", "beats", "untagged");
      break;
    default:
      throw new AppError(`${fieldName} is not allowed.`, 400, true);
  }

  /* if (!fs.existsSync(desc)) {
    fs.mkdirSync(desc, { recursive: true });
  } */
  return desc;
};

/* Memory storage */
const storage = multer.memoryStorage();

/* File filter */
const fileFilter = async (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): Promise<void> => {
  const fileType = file.mimetype;
  // Check audio files
  if (file.fieldname === "untaggedBeat" || file.fieldname === "taggedBeat") {
    const allowedAudioMimeTypes = ["audio/mpeg", "audio/wav", "audio/midi"];
    if (allowedAudioMimeTypes.includes(fileType)) {
      cb(null, true);
    } else {
      cb(new AppError("Only audio files are allowed.", 400, true));
    }
  }
  // Check document files
  if (
    file.fieldname === "basicLicense" ||
    file.fieldname === "premiumLicense"
  ) {
    const allowedDocumentMimeTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/pdf",
      "text/plain",
      "application/wps-office.docx",
    ];

    if (allowedDocumentMimeTypes.includes(fileType)) {
      cb(null, true);
    } else {
      cb(new AppError("Only documents files are allowed.", 400, true));
    }
  }
};

/* Track upload multer middleware */
const upload = multer({
  storage,
  limits: { fileSize: 5000000 },
  fileFilter,
}).fields([
  { name: "basicLicense", maxCount: 1 },
  { name: "premiumLicense", maxCount: 1 },
  { name: "untaggedBeat", maxCount: 1 },
  { name: "taggedBeat", maxCount: 1 },
]);

/* Profile picture multer middlware */
export const uploadPicture = multer({
  limits: { fieldSize: 5000000 },
  storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedFileType: string[] = [
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/webp",
    ];

    if (allowedFileType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Only images are allowed", 400, false));
    }
  },
}).single("picture");

export default upload;
