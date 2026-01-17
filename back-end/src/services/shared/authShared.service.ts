import { generateRandCode } from "../../utils/helpers.js";
import bcrypt from "bcrypt";
import env from "../../configs/env.js";

/* Create hash password and email verification */
interface hashpasswordAndEmailVerificationInterface {
  hashPassword: string;
  emailVerification: { code: string | number; expiredAt: Date };
}

export const createHashpasswordAndEmailVerification = async (
  password: string,
  codeExpirationTime: number
): Promise<hashpasswordAndEmailVerificationInterface> => {
  const hashPassword: string = await bcrypt.hash(password, env.HASH_SALT_NUMBER);
  const verificationCode: number | string = generateRandCode(6);

  const emailVerification = {
    code: verificationCode,
    expiredAt: new Date(Date.now() + codeExpirationTime * 60 * 1000),
  };

  return { hashPassword, emailVerification };
};
