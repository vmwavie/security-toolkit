import { createHmac } from "crypto";
import { decode } from "../../helpers/crypt/index";

function generateCode(secret: string, counter: number): string {
  const decodedSecret = decode(secret);

  const counterBytes = Buffer.alloc(8);

  for (let i = 0; i < 8; i++) {
    counterBytes[7 - i] = counter & 0xff;
    counter >>= 8;
  }

  const hmac = createHmac("sha1", Buffer.from(decodedSecret));
  hmac.update(counterBytes);
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

function validateUserCode(secret: string, code: string, counter: number, window: number): boolean {
  const normalizedCode = code.replace(/[\s.,-]/g, "");

  for (let i = 0; i <= window; i++) {
    const hotpCode = generateCode(secret, counter + i);

    if (hotpCode === normalizedCode) {
      return true;
    }
  }

  return false;
}

export { generateCode, validateUserCode };
