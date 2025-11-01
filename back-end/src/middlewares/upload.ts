import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const homePath = path.dirname(fileURLToPath(import.meta.url));
const _dirName = path.join(homePath, "..", "..");
import type { Request, Response } from "express";
import AppError from "../errors/appError.js";

// for deleting files if an error occur
export const deleteFile = (files: any) => {
  for (const field of Object.keys(files)) {
    files[field].forEach((file: any) => {
      fs.unlink(file.path, (err) => {
        if (err) throw err;
      });
    });
  }
};

// function to determine which folder to save file
const determineDest = (fieldName: string): string => {
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

  if (!fs.existsSync(desc)) {
    fs.mkdirSync(desc, { recursive: true });
  }
  return desc;
};

// multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const f = determineDest(file.fieldname);
    cb(null, f);
  },
  filename: function (req, file, cb) {
    const name = file.originalname.split(".")[0]?.replace(/ /g, "-");

    cb(null, name + "-" + Date.now() + path.extname(file.originalname));
  },
});

// file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: any): void => {
  const m = file.mimetype;
  switch (m) {
    case "application/pdf":
      cb(null, true);
      break;
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      cb(null, true);
      break;
    case "text/plain":
      cb(null, true);
      break;
    case "application/msword":
      cb(null, true);
      break;
    default:
      throw new AppError(
        "Only docs, text files and pdfs are allowed for license.",
        400,
        true
      );
  }
};

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

export default upload;
