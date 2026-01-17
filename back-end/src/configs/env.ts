import { configDotenv } from "dotenv";
configDotenv();
import path from "path";
import { fileURLToPath } from "url";
const homePath = path.dirname(fileURLToPath(import.meta.url));
const _dirName = path.join(homePath, "..", "..");

interface loginCookieOpts {
  secure: boolean;
  maxAge: number;
  sameSite: boolean | "lax" | "strict" | "none" | undefined;
  httpOnly: true;
}

// type definition
interface Env {
  MONGO_URI: string;
  PORT: number | string;
  NODE_ENV: string | boolean;
  EMAIL_PASSWORD: string;
  EMAIL_USER: string;
  ADMIN_EMAIL: string;
  APP_NAME: string;
  TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BACKEND_URL: string;
  FRONTEND_URL: string;
  FRONTEND_LOGIN_URL: string;
  FRONTEND_SIGNUP_URL: string;
  LOGIN_COOKIE_OPTS: loginCookieOpts;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_NAME: string;
  CLOUDINARY_SECRET: string;
  SUPABASE_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  SUPABASE_URL: string;
  DIR_NAME: string;
  AUDIO_FILES_BUCKET: string;
  DOCUMENT_FILES_BUCKET: string;
  IMAGE_FILES_BUCKET: string;
  GOOGLE_OAUTH2_URL: string;
  TAGGED_AUDIO_FOLDER: string;
  UNTAGGED_AUDIO_FOLDER: string;
  BASIC_LICENSE_FOLDER: string;
  PREMIUM_LICENSE_FOLDER: string;
  HASH_SALT_NUMBER: number;
  TRACK_COVER_IMAGE_FOLDER: string;
  USER_AVATAR_FOLDER: string;
}

const env: Env = {
  MONGO_URI: process.env.MONGO_URI || "",
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || false,
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  APP_NAME: process.env.APP_NAME || "Siwel Beatz App",
  TOKEN_SECRET: process.env.TOKEN_SECRET || "",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8080",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  FRONTEND_LOGIN_URL: process.env.FRONTEND_LOGIN_URL || "",
  FRONTEND_SIGNUP_URL: process.env.FRONTEND_SIGNUP_URL || "",
  LOGIN_COOKIE_OPTS: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
    httpOnly: true,
  },
  CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET || "",
  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  SUPABASE_KEY: process.env.SUPABASE_KEY || "",
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || "",
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  DIR_NAME: _dirName,
  AUDIO_FILES_BUCKET: process.env.AUDIO_FILES_BUCKET || "audios",

  DOCUMENT_FILES_BUCKET: process.env.DOCUMENT_FILES_BUCKET || "documents",
  IMAGE_FILES_BUCKET: process.env.IMAGE_FILES_BUCKET || "images",
  GOOGLE_OAUTH2_URL:
    process.env.GOOGLE_OAUTH2_URL ||
    "https://accounts.google.com/o/oauth2/v2/auth",
  TAGGED_AUDIO_FOLDER: process.env.TAGGED_AUDIO_FOLDER || "taggedBeat/",
  UNTAGGED_AUDIO_FOLDER: process.env.UNTAGGED_AUDIO_FOLDER || "untaggedBeat/",
  BASIC_LICENSE_FOLDER: process.env.BASIC_LICENSE_FOLDER || "basicLicense/",
  PREMIUM_LICENSE_FOLDER:
    process.env.PREMIUM_LICENSE_FOLDER || "premiumLicense/",
  HASH_SALT_NUMBER: 10,
  TRACK_COVER_IMAGE_FOLDER:
    process.env.TRACK_COVER_IMAGE_FOLDER || "coverImages/",
  USER_AVATAR_FOLDER: process.env.USER_AVATAR_FOLDER || "userAvatars/",
};

export default env;
