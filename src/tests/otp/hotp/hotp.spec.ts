import SecurityToolKit from "../../../index";

describe("hotp", () => {
  let toolkit: SecurityToolKit;

  beforeEach(() => {
    toolkit = new SecurityToolKit({}, { HOTP: { counter: 0, window: 1 } });
  });

  test("should a generate code", () => {
    const secret = toolkit.generateSecret();
    const code = toolkit.hotpMethods.generateCode(secret);

    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);
  });

  test("should generate a code", () => {
    const secret = toolkit.generateSecret();
    const code = toolkit.hotpMethods.generateCode(secret);

    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);
  });

  test("should generate and validate a code", () => {
    const secret = toolkit.generateSecret();
    const code = toolkit.hotpMethods.generateCode(secret);

    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);

    const isValid = toolkit.hotpMethods.validateUserCode(secret, code);
    expect(isValid).toBe(true);
  });
});
