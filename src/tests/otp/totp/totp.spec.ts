import SecurityToolKit from "../../../index";

describe("totp", () => {
  let toolkit: SecurityToolKit;

  beforeEach(() => {
    toolkit = new SecurityToolKit({ TOTP: { timeStep: 30, window: 30 } });
  });

  test("should generate a secret", () => {
    const secret = toolkit.totpMethods.generateSecret();
    expect(typeof secret).toBe("string");
    expect(secret).toHaveLength(24);
  });

  test("should decode a secret", () => {
    const secret = toolkit.totpMethods.generateSecret();
    const decoded = toolkit.totpMethods.decodeSecret(secret);
    expect(decoded).toBeInstanceOf(Buffer);
  });

  test("should generate a QR code URI", () => {
    const secret = toolkit.totpMethods.generateSecret();
    const uri = toolkit.totpMethods.generateQRCodeURI(secret, "Company", "User");
    expect(typeof uri).toBe("string");
    expect(uri.startsWith("otpauth://totp")).toBe(true);
    expect(uri).toContain("Company");
    expect(uri).toContain("User");
    expect(uri).toContain("secret");
  });

  test("should generate a code", () => {
    const secret = toolkit.totpMethods.generateSecret();
    const code = toolkit.totpMethods.generateCode(secret);

    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);
  });

  test("should generate and validate a code", () => {
    const secret = toolkit.totpMethods.generateSecret();
    const code = toolkit.totpMethods.generateCode(secret);

    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);

    const isValid = toolkit.totpMethods.validateUserCode(secret, code);
    expect(isValid).toBe(true);
  });
});
