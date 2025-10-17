import { configDotenv } from "dotenv";
configDotenv();

// type definition
interface Env {
  MONGO_URI: string | "";
  PORT: number | string;
  NODE_ENV: string | boolean;
  EMAIL_PASSWORD: string;
  EMAIL_USER: string;
  ADMIN_EMAIL: string;
  APP_NAME: string;
}

const env: Env = {
  MONGO_URI: process.env.MONGO_URI || "",
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || false,
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  APP_NAME: process.env.APP_NAME || "Siwel Beatz App",
};

export default env;
