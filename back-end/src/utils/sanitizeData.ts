import xss from "xss";

const sanitizeValue = (
  value: string | number,
  fieldName: string = ""
): string | number => {
  if (typeof value === "number" || typeof value === "boolean") return value;

  let cleanData = value.trim();
  if (
    fieldName &&
    (fieldName === "password" || fieldName === "confirmPassword")
  ) {
    cleanData = cleanData.normalize("NFC");
    return cleanData;
  }

  cleanData = xss(cleanData);
  return cleanData;
};

const sanitizeData = (
  data: string | number | object | [],
  fieldName: string = ""
): any => {
  if (Array.isArray(data)) {
    let arrayData = [];
    for (const value of data) {
      const cleanValue = sanitizeData(value);
      arrayData.push(cleanValue);
    }
    return arrayData;
  } else if (typeof data === "object") {
    const objData: any = {};
    for (const [field, value] of Object.entries(data)) {
      objData[field] = sanitizeData(value, field);
    }
    return objData;
  } else {
    return sanitizeValue(data as string | number, fieldName);
  }
};

export default sanitizeData;

// const data = sanitizeData({
//   name: "Bulus Hamnu",
//   age: 22,
//   profession: "Programmer",
//   hobbies: [
//     "programming",
//     "watching yt",
//     "reading",
//     "<img src=x onerror=alert(1)>",
//   ],
//   houses: {
//     "Indigeous House1": "In bauchi nigeria",
//     "Indigeous House2": "In bauchi london",
//   },
//   password: "don't ask me for password!",
//   cars: ['<script>alert("XSS")</script>', "BMW", "aston martin"],
// });

// console.log(data);
