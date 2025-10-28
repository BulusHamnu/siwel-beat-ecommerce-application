import env from "../configs/env.js";

// generate code func
export const generateRandCode = (length: number = 6): number | string => {
  let code: number | string = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10) as number;
  }
  return code;
};

// console.log(generateRandCode(6));

export const setRedirect = (route: string = "register"): string => {
  const loginRedirectUri = `${env.BACKEND_URL}/api/auth/google/login-fallback`;
  const registerRedirectUri = `${env.BACKEND_URL}/api/auth/google/register-fallback`;

  const r = route === "register" ? registerRedirectUri : loginRedirectUri;

  return r;
};
