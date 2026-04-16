import type { Express } from "express";
export interface Payload {
  id: string;
  isVerified: boolean;
  email: string;
  role: string;
  isActive: boolean;
  type: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: Payload;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}
