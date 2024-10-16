import { encode, decode } from "../crypt/index";
import * as crypto from "crypto";

function generateSecret(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(15);
    window.crypto.getRandomValues(array);
    return encode(String.fromCharCode.apply(null, Array.from(array)));
  } else if (typeof require !== "undefined") {
    const crypto = require("crypto");
    return encode(crypto.randomBytes(15).toString("binary"));
  } else {
    throw new Error("No secure random number generator available");
  }
}
function decodeSecret(secret: string): Buffer {
  return decode(secret);
}

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

  const hmac = crypto.createHmac("sha1", Buffer.from(decodedSecret));
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

function generateQRCodeURI(secret: string, companyName: string, userName: string): string {
  return `otpauth://totp/${userName}?secret=${secret}&issuer=${companyName}`;
}

export { generateSecret, decodeSecret, generateCode, generateQRCodeURI, validateUserCode };
