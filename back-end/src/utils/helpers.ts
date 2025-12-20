/* Generate random code */
export const generateRandCode = (length: number = 6): number | string => {
  let code: number | string = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10) as number;
  }
  return code;
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
