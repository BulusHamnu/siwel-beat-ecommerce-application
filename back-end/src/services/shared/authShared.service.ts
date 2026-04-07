import { generateHashValue, generateRandCode } from "../../utils/helpers.js";
import bcrypt from "bcrypt";
import env from "../../configs/env.js";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, env.HASH_SALT_NUMBER);
}

export const createEmailVerificationCode = async (
  codeExpirationTime: number,
): Promise<{ code: number; hashedCode: string; expiresAt: Date }> => {
  const code = generateRandCode(6) as number;
  const hashedCode = generateHashValue(code);
  const expiresAt = new Date(Date.now() + codeExpirationTime * 60 * 1000);

  return { code, hashedCode, expiresAt };
};
