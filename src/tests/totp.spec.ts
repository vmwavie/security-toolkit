import SecurityToolKit from "../index";
import { Constructor } from "../totp/types/index";

describe("totp", () => {
  let toolkit: SecurityToolKit;

  beforeEach(() => {
    const config: Constructor = { TOTP: { timeStep: 30, window: 30 } };
    toolkit = new SecurityToolKit(config);
  });

  test("should generate a secret", () => {
    const secret = toolkit.generateSecret();
    expect(typeof secret).toBe("string");
    expect(secret).toHaveLength(24);
  });

  test("should decode a secret", () => {
    const secret = toolkit.generateSecret();
    const decoded = toolkit.decodeSecret(secret);
    expect(decoded).toBeInstanceOf(Buffer);
  });

  test("should generate and validate a code", () => {
    const secret = toolkit.generateSecret();
    const code = toolkit.generateCode(secret);

    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);

    const isValid = toolkit.validateUserCode(secret, code);
    expect(isValid).toBe(true);
  });

  test("should generate a QR code URI", () => {
    const secret = toolkit.generateSecret();
    const uri = toolkit.generateQRCodeURI(secret, "Company", "User");
    expect(typeof uri).toBe("string");
    expect(uri.startsWith("otpauth://")).toBe(true);
    expect(uri).toContain("Company");
    expect(uri).toContain("User");
    expect(uri).toContain("secret");
  });
});
