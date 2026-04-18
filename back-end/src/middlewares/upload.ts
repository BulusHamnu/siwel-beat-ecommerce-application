import multer, { type Multer } from "multer";
import path from "path";
import fs from "fs";
import env from "../configs/env.js";
import type { Request } from "express";
import AppError, { ErrorCodes } from "../errors/appError.js";

type multerFiles = { [fieldname: string]: Express.Multer.File[] };
export interface MulterTrackFiles extends multerFiles {
  coverImage: Express.Multer.File[];
  taggedAudio: Express.Multer.File[];
  untaggedAudio: Express.Multer.File[];
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
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        `Unsupported field.`,
        400,
        true,
        { fieldname: fieldName },
      );
  }

  /* if (!fs.existsSync(desc)) {
    fs.mkdirSync(desc, { recursive: true });
  } */
  return desc;
};

/* Memory storage */
const storage = multer.memoryStorage();

/* File filter */
const imageAllowedFileType: string[] = [
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
];

const fileFilter = async (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): Promise<void> => {
  const fileType = file.mimetype;
  // Check for image files
  if (file.fieldname === "coverImage") {
    if (imageAllowedFileType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          ErrorCodes.VALIDATION_ERROR,
          "Only images are allowed for coverImage.",
          400,
          true,
          null,
        ),
      );
    }
  }
  // Check audio files
  if (file.fieldname === "untaggedAudio" || file.fieldname === "taggedAudio") {
    const allowedAudioMimeTypes = ["audio/mpeg", "audio/wav", "audio/midi"];
    if (allowedAudioMimeTypes.includes(fileType)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          ErrorCodes.VALIDATION_ERROR,
          "Only audio files are allowed.",
          400,
          true,
          null,
        ),
      );
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
      cb(
        new AppError(
          ErrorCodes.VALIDATION_ERROR,
          "Only documents files are allowed for track licenses..",
          400,
          true,
          null,
        ),
      );
    }
  }
};

/* Track upload multer middleware */
const upload = multer({
  storage,
  limits: { fileSize: 5000000 },
  fileFilter,
}).fields([
  { name: "coverImage", maxCount: 1 },
  { name: "basicLicense", maxCount: 1 },
  { name: "premiumLicense", maxCount: 1 },
  { name: "untaggedAudio", maxCount: 1 },
  { name: "taggedAudio", maxCount: 1 },
]);

/* Profile picture multer middlware */
export const uploadAvatar = multer({
  limits: { fieldSize: 5000000 },
  storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    if (imageAllowedFileType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          ErrorCodes.VALIDATION_ERROR,
          "Only images are allowed",
          400,
          true,
          null,
        ),
      );
    }
  },
}).single("avatar");

export default upload;
