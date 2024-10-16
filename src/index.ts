import { Constructor } from "./totp/types/index";
import {
  generateSecret,
  decodeSecret,
  generateCode,
  generateQRCodeURI,
  validateUserCode,
} from "./totp/index";

class SecurityToolKit {
  private timeStep: number;
  private window: number;

  public generateSecret: () => string;
  public decodeSecret: (secret: string) => Buffer;
  public generateCode: (secret: string) => string;
  public generateQRCodeURI: (secret: string, companyName: string, userName: string) => string;
  public validateUserCode: (secret: string, code: string) => boolean;

  constructor({ TOTP: { timeStep = 30, window = 30 } }: Constructor) {
    this.timeStep = timeStep;
    this.window = window;

    this.generateSecret = () => generateSecret();
    this.decodeSecret = (secret: string) => decodeSecret(secret);
    this.generateCode = (secret: string) => generateCode(secret, this.timeStep, false);
    this.generateQRCodeURI = (secret: string, companyName: string, userName: string) =>
      generateQRCodeURI(secret, companyName, userName);
    this.validateUserCode = (secret: string, code: string) =>
      validateUserCode(secret, code, this.timeStep, this.window);
  }
}

export default SecurityToolKit;
