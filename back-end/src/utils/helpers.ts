import { imageSize } from "image-size";
import AppError from "../errors/appError.js";
import sharp from "sharp";

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

/* Check for image ratio and rezise if needed */
export async function checkAndResizeImgRatio(
  imageBuffer: Buffer,
  type: string
): Promise<Buffer> {
  const { height, width } = imageSize(imageBuffer);
  console.log({ height, width });

  // Resize banner
  if (type === "banner") {
    if (width < 1920 || height < 600) {
      throw new AppError("Image must be 1920 * 600.", 400, true);
    }
    // Banner need to be a perfect 1920 × 600
    if (width !== 1920 || height !== 600) {
      const newBannerBuffer = await sharp(imageBuffer)
        .resize(1920, 600)
        .webp({ quality: 80 })
        .toBuffer();
      return newBannerBuffer;
    }

    return imageBuffer;
  }

  // Any other image should be square
  // A perfect square image will be good on any display
  if (height !== width) {
    throw new AppError("Image width and height must be the same.", 400, true);
  }

  // Resize avatar
  if (type === "avatar" && (height > 512 || width > 512)) {
    // 512 is the best size for an Avatar
    const newAvatarBuffer = await sharp(imageBuffer)
      .resize(512, 512)
      .webp({ quality: 80 })
      .toBuffer();
    return newAvatarBuffer;
  }

  if (height > 1024 && width > 1024) {
    const newBuffer = await sharp(imageBuffer)
      .resize(1024, 1024)
      .webp({ quality: 80 })
      .toBuffer();
    return newBuffer;
  }

  return imageBuffer;
}
