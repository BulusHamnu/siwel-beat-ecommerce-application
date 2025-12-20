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
  SECRET_KEY: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
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
  LICENSE_FILES_BUCKET: string;
  IMAGE_FILES_BUCKET: string;
  GOOGLEOAUTH2URL: string;
}

const env: Env = {
  MONGO_URI: process.env.MONGO_URI || "",
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || false,
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  APP_NAME: process.env.APP_NAME || "Siwel Beatz App",
  SECRET_KEY: process.env.SECRET_KEY || "",
  CLIENT_SECRET: process.env.CLIENT_SECRET || "",
  CLIENT_ID: process.env.CLIENT_ID || "",
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
  LICENSE_FILES_BUCKET: process.env.LICENSE_FILES_BUCKET || "documents",
  IMAGE_FILES_BUCKET: process.env.IMAGE_FILES_BUCKET || "images",
  GOOGLEOAUTH2URL:
    process.env.GOOGLEOAUTH2URL ||
    "https://accounts.google.com/o/oauth2/v2/auth",
};

export default env;
