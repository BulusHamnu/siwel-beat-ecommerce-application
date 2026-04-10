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
  path: string;
}

// type definition
interface Env {
  MONGO_URI: string;
  PORT: number | string;
  NODE_ENV: string;
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
  HASH_SALT_NUMBER: number;
  GOOGLE_REDIRECT_URL: string;
  SIGNED_URL_TTL: number;
}

const env: Env = {
  MONGO_URI: process.env.MONGO_URI || "",
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  APP_NAME: process.env.APP_NAME || "Siwel Beatz App",
  TOKEN_SECRET: process.env.TOKEN_SECRET || "",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:8080",
  LOGIN_COOKIE_OPTS: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
    httpOnly: true,
    path: "/api/v1/auth",
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
  HASH_SALT_NUMBER: 10,
  GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL || "",

  SIGNED_URL_TTL: Number(process.env.SIGNED_URL_TTL) || 120,
};

export default env;
