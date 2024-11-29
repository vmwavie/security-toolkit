import SecurityToolKit from "../../../index";

describe("hotp", () => {
  let toolkit: SecurityToolKit;

  beforeEach(() => {
    toolkit = new SecurityToolKit({}, { HOTP: { counter: 0, window: 1 } });
  });

  test("should generate a secret", () => {
    const secret = toolkit.hotpMethods.generateSecret();
    expect(typeof secret).toBe("string");
    expect(secret).toHaveLength(24);
  });

  test("should decode a secret", () => {
    const secret = toolkit.hotpMethods.generateSecret();
    const decoded = toolkit.hotpMethods.decodeSecret(secret);
    expect(decoded).toBeInstanceOf(Buffer);
  });

  test("should generate a QR code URI", () => {
    const secret = toolkit.hotpMethods.generateSecret();
    const uri = toolkit.hotpMethods.generateQRCodeURI(secret, "Company", "User");
    expect(typeof uri).toBe("string");
    expect(uri.startsWith("otpauth://hotp")).toBe(true);
    expect(uri).toContain("Company");
    expect(uri).toContain("User");
    expect(uri).toContain("secret");
  });

  test("should a generate code", () => {
    const secret = toolkit.hotpMethods.generateSecret();
    const code = toolkit.hotpMethods.generateCode(secret);

    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);
  });

  test("should generate a code", () => {
    const secret = toolkit.hotpMethods.generateSecret();
    const code = toolkit.hotpMethods.generateCode(secret);

    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);
  });

  test("should generate and validate a code", () => {
    const secret = toolkit.hotpMethods.generateSecret();
    const code = toolkit.hotpMethods.generateCode(secret);

    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);

    const isValid = toolkit.hotpMethods.validateUserCode(secret, code);
    expect(isValid).toBe(true);
  });
});
