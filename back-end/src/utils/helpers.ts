// generate code func
export const generateRandCode = (length: number = 6): number | string => {
  let code: number | string = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10) as number;
  }
  return code;
};

// console.log(generateRandCode(6));
