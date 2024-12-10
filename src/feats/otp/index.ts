import { decodeSecret, generateQRCodeURI, generateSecret } from "./base";
import {
  generateCode as TOTP_generateCode,
  validateUserCode as TOTP_validateUserCode,
} from "./totp";
import {
  generateCode as HOTP_generateCode,
  validateUserCode as HOTP_validateUserCode,
} from "./hotp";

export {
  decodeSecret,
  generateQRCodeURI,
  generateSecret,
  TOTP_generateCode,
  TOTP_validateUserCode,
  HOTP_generateCode,
  HOTP_validateUserCode,
};
