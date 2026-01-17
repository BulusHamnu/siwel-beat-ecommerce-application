import type { Express } from "express";
export interface Payload {
  id: string;
  isVerified: boolean;
  email: string;
  role: string;
  isActive: string;
  type: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: Payload;
    }
  }
}
