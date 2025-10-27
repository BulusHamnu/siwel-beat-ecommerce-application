import { configDotenv } from "dotenv";
configDotenv();

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
};

export default env;
