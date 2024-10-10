import { Constructor } from "totp/types";
import { generateSecret, generateCode, generateQRCodeURI, validateUserCode } from "./totp/index";

class SecurityToolKit {
  private timeStep: number;
  private window: number;

  public generateSecret: (secret?: string) => string;
  public generateCode: (secret: string) => string;
  public generateQRCodeURI: (secret: string) => string;
  public validateUserCode: (secret: string, code: string) => boolean;

  constructor({ TOTP: { timeStep = 30, window = 30 } }: Constructor) {
    this.timeStep = timeStep;
    this.window = window;

    this.generateSecret = (secret?: string) => generateSecret(secret);
    this.generateCode = (secret: string) => generateCode(secret, this.timeStep, false);
    this.generateQRCodeURI = (secret: string) => generateQRCodeURI(secret);
    this.validateUserCode = (secret: string, code: string) =>
      validateUserCode(secret, code, this.window);
  }
}

export default SecurityToolKit;
