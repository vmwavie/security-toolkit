import { randomBytes } from "crypto";
import { encode, decode } from "../../helpers/crypt/index";

function generateSecret(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(15);
    window.crypto.getRandomValues(array);
    return encode(String.fromCharCode.apply(null, Array.from(array)));
  } else if (typeof require !== "undefined") {
    return encode(randomBytes(15).toString("binary"));
  } else {
    throw new Error("No secure random number generator available");
  }
}

function decodeSecret(secret: string): Buffer {
  return decode(secret);
}

function generateQRCodeURI(
  secret: string,
  companyName: string,
  userName: string,
  method: "hotp" | "totp"
): string {
  return `otpauth://${method}/${userName}?secret=${secret}&issuer=${companyName}`;
}

export { generateSecret, decodeSecret, generateQRCodeURI };
