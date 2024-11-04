import SecurityToolKit from "../../../index";

describe("otp", () => {
  let toolkit: SecurityToolKit;

  beforeEach(() => {
    toolkit = new SecurityToolKit({}, {});
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
