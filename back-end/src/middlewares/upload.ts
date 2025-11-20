import multer, { type Multer } from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const homePath = path.dirname(fileURLToPath(import.meta.url));
const _dirName = "siwel-app"; //path.join(homePath, "..", "..");
import type { Request, Response } from "express";
import AppError from "../errors/appError.js";

// for deleting files if an error occur
export const deleteFiles = (files: any) => {
  for (const field of Object.keys(files)) {
    files[field].forEach((file: any) => {
      fs.unlink(file.path, (err) => {
        if (err) throw err;
      });
    });
  }
};

// function to determine which folder to save file
export const determineDest = (fieldName: string): string => {
  let desc = "";

  switch (fieldName) {
    case "basicLicense":
      desc = path.join(_dirName, "uploads", "licenses", "basics");
      break;
    case "premiumLicense":
      desc = path.join(_dirName, "uploads", "licenses", "premiums");
      break;
    case "untaggedBeat":
      desc = path.join(_dirName, "uploads", "beats", "tagged");
      break;
    case "taggedBeat":
      desc = path.join(_dirName, "uploads", "beats", "untagged");
      break;
    default:
      throw new AppError(`${fieldName} is not allowed.`, 400, true);
  }

  /* if (!fs.existsSync(desc)) {
    fs.mkdirSync(desc, { recursive: true });
  } */
  return desc;
};

// multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const f = determineDest(file.fieldname);
//     cb(null, f);
//   },
//   filename: function (req, file, cb) {
//     const name = file.originalname.split(".")[0]?.replace(/ /g, "-");

//     cb(null, name + "-" + Date.now() + path.extname(file.originalname));
//   },
// });

// memory storage
const storage = multer.memoryStorage();

// file filter
const fileFilter = async (
  req: Request,
  file: Express.Multer.File,
  cb: any
): Promise<void> => {
  const fileType = file.mimetype;
  // check the audio files
  if (file.fieldname === "untaggedBeat" || file.fieldname === "taggedBeat") {
    const allowedAudioMimeTypes = ["audio/mpeg", "audio/wav", "audio/midi"];
    if (allowedAudioMimeTypes.includes(fileType)) {
      cb(null, true);
    } else {
      cb(new AppError("Only audio files are allowed!", 400, true), true);
    }
  }

  // check docs files
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
      cb(new AppError("Only documents files are allowed!", 400, true), true);
    }
  }
};

// profile picture multer middleware
export const uploadPicture = multer({
  limits: { fieldSize: 5000000 },
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    const allowedFileType: string[] = [
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/webp",
    ];

    if (allowedFileType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Only image is allowed", 400, true));
    }
  },
}).single("picture");

// track files upload multer middleware
const upload = multer({
  storage,
  limits: { fileSize: 6000000 },
  fileFilter,
}).fields([
  { name: "basicLicense", maxCount: 1 },
  { name: "premiumLicense", maxCount: 1 },
  { name: "untaggedBeat", maxCount: 1 },
  { name: "taggedBeat", maxCount: 1 },
]);

export default upload;
