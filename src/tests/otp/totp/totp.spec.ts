import SecurityToolKit from "../../../index";

describe("totp", () => {
  let toolkit: SecurityToolKit;

  beforeEach(() => {
    toolkit = new SecurityToolKit({ TOTP: { timeStep: 30, window: 30 } });
  });

  test("should generate a code", () => {
    const secret = toolkit.generateSecret();
    const code = toolkit.totpMethods.generateCode(secret);

    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);
  });

  test("should generate and validate a code", () => {
    const secret = toolkit.generateSecret();
    const code = toolkit.totpMethods.generateCode(secret);

    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);

    const isValid = toolkit.totpMethods.validateUserCode(secret, code);
    expect(isValid).toBe(true);
  });
});
