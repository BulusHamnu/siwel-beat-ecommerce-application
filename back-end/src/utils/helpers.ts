import env from "../configs/env.js";
import bcrypt from "bcrypt";

// generate code func
export const generateRandCode = (length: number = 6): number | string => {
  let code: number | string = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10) as number;
  }
  return code;
};

export const setRedirect = (route: string = "register"): string => {
  const loginRedirectUri = `${env.BACKEND_URL}/api/auth/google/login-fallback`;
  const registerRedirectUri = `${env.BACKEND_URL}/api/auth/google/register-fallback`;

  const r = route === "register" ? registerRedirectUri : loginRedirectUri;

  return r;
};

// mongoose model functions
export function removeUnwantedField<T extends Document & { toObject(): any }>(
  this: T
): T {
  const obj = this.toObject();
  delete obj.resetPasswordVerification;
  delete obj.emailVerification;
  delete obj.password;
  delete obj.google;
  return obj;
}
export async function comparePassword(
  this: Document & { toObject(): any },
  password: string
): Promise<boolean> {
  const obj = this.toObject();
  return await bcrypt.compare(password, obj.password);
}

interface hashpasswordAndEmailVerificationInterface {
  hashPassword: string;
  emailVerification: { code: string | number; expiredAt: Date };
}

// function to hash password and create email verification after sign up
export const createHashpasswordAndEmailVerification = async (
  password: string,
  codeExpirationTime: number
): Promise<hashpasswordAndEmailVerificationInterface> => {
  const hashPassword: string = await bcrypt.hash(password, 10);
  const verificationCode: number | string = generateRandCode(6);

  const emailVerification = {
    code: verificationCode,
    expiredAt: new Date(Date.now() + codeExpirationTime * 60 * 1000),
  };

  return { hashPassword, emailVerification };
};

/* Get date range function */
export function getDateRange(date: string) {
  const [year, month, day] = date.split("-");

  const start = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0)
  );
  const end = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999)
  );

  return { start, end };
}
