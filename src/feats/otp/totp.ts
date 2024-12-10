import { createHmac } from "crypto";
import { decode } from "../../helpers/crypt/index";

function generateCode(secret: string, timeStep: number, haveWindow: boolean): string {
  const decodedSecret = decode(secret);

  if (!haveWindow) {
    const currentTime = Math.floor(Date.now() / 1000);
    timeStep = Math.floor(currentTime / timeStep);
  }

  const timeBytes = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) {
    timeBytes[7 - i] = timeStep & 0xff;
    timeStep >>= 8;
  }

  const hmac = createHmac("sha1", Buffer.from(decodedSecret));
  hmac.update(timeBytes);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0xf;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

function validateUserCode(
  secret: string,
  code: string,
  timeStepBase: number,
  windowSize: number
): boolean {
  const normalizedCode = code.replace(/ /g, "").replace(".", "").replace("-", "").replace(",", "");
  const currentTime = Math.floor(Date.now() / 1000);

  for (let i = -windowSize; i <= windowSize; i++) {
    const timeStep = Math.floor(currentTime / timeStepBase) + i;
    const serverCode = generateCode(secret, timeStep, true);
    if (serverCode === normalizedCode) {
      return true;
    }
  }

  return false;
}

export { generateCode, validateUserCode };
