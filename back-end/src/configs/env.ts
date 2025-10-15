import { configDotenv } from "dotenv";
configDotenv()

// type definition
interface Env {
  MONGO_URI: string | "";
  PORT: number | string;
  NODE_ENV: string | boolean;
}

const env: Env = {
  MONGO_URI: process.env.MONGO_URI || "",
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || false,
};

export default env;
