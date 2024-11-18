import { generateDeviceDataLogger, ipTracker } from "./feats/loggers";
import { emailIsValid, passwordComplexity } from "./feats/checkers";
import {
  generateSecret,
  decodeSecret,
  generateQRCodeURI,
  HOTP_generateCode,
  HOTP_validateUserCode,
  TOTP_generateCode,
  TOTP_validateUserCode,
} from "./feats/otp/index";

class SecurityToolKit {
  generateSecret: () => string;
  decodeSecret: (secret: string) => Buffer;
  generateQRCodeURI: (secret: string, companyName: string, userName: string) => string;

  totpMethods: {
    generateCode: (secret: string) => string;
    validateUserCode: (secret: string, code: string) => boolean;
  };

  hotpMethods: {
    generateCode: (secret: string) => string;
    validateUserCode: (secret: string, code: string) => boolean;
  };

  checkersMethods: {
    passwordComplexity: (password: string) => {
      strength: "weak" | "medium" | "strong";
      message: string;
    };
    emailIsValid: (email: string) => Promise<{ isValid: boolean; trust: number }>;
  };

  loggerMethods: {
    generateDeviceDataLogger: () => Promise<{
      ip: string;
      userAgent: string;
      geolocation: {
        long: string | void;
        lat: string | void;
      };
      isIncognito: boolean;
      isMalicious: number;
    }>;
    ipTracker: (ip: string) => Promise<{
      ip: string;
      geolocation: {
        long: string | void;
        lat: string | void;
      };
      hostname: string | void;
      city: string | void;
      region: string | void;
      country: string | void;
    }>;
  };

  constructor(
    { TOTP = { timeStep: 30, window: 30 } }: { TOTP?: { timeStep: number; window: number } } = {},
    { HOTP = { counter: 0, window: 1 } }: { HOTP?: { counter: number; window: number } } = {},
    { API_KEYS = { ipInfoKey: "" } }: { API_KEYS?: { ipInfoKey: string } } = {}
  ) {
    this.generateSecret = () => generateSecret();
    this.decodeSecret = (secret: string) => decodeSecret(secret);
    this.generateQRCodeURI = (secret: string, companyName: string, userName: string) =>
      generateQRCodeURI(secret, companyName, userName);

    const totpMethods = {
      generateCode: (secret: string) => TOTP_generateCode(secret, TOTP.timeStep, false),
      validateUserCode: (secret: string, code: string) =>
        TOTP_validateUserCode(secret, code, TOTP.timeStep, TOTP.window),
    };

    const hotpMethods = {
      generateCode: (secret: string) => HOTP_generateCode(secret, HOTP.counter),
      validateUserCode: (secret: string, code: string) =>
        HOTP_validateUserCode(secret, code, HOTP.counter, HOTP.window),
    };

    const checkersMethods = {
      passwordComplexity: (password: string) => passwordComplexity(password),
      emailIsValid: async (email: string) => await emailIsValid(email),
    };

    const loggerMethods = {
      generateDeviceDataLogger: async () => await generateDeviceDataLogger(),
      ipTracker: async (ip: string) => await ipTracker(ip, API_KEYS.ipInfoKey),
    };

    this.totpMethods = totpMethods;
    this.hotpMethods = hotpMethods;
    this.checkersMethods = checkersMethods;
    this.loggerMethods = loggerMethods;
  }
}

export default SecurityToolKit;
