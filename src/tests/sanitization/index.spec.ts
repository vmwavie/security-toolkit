import SecurityToolKit from "../../index";
import { FIELDS_HIDE_TESTS, SQL_TESTS, XSS_TESTS } from "./constants/index";

describe("SecurityToolKit sanitizerMethods", () => {
  let securityToolKit: SecurityToolKit;

  beforeEach(() => {
    securityToolKit = new SecurityToolKit();
  });

  describe("sanitizeSQLInjection", () => {
    SQL_TESTS.forEach((test, index) => {
      it(`should handle SQL injection test case ${index + 1}`, () => {
        const result = securityToolKit.sanitizerMethods.sanitizeSQLInjection(test.input);
        expect(result).toEqual(test.expected);
      });
    });
  });

  describe("sanitizeXSSInjection", () => {
    XSS_TESTS.forEach((test, index) => {
      it(`should handle XSS injection test case ${index + 1}`, () => {
        const result = securityToolKit.sanitizerMethods.sanitizeXSSInjection(test.input);
        expect(result).toEqual(test.expected);
      });
    });
  });

  describe("fieldsHide", () => {
    FIELDS_HIDE_TESTS.forEach((test, index) => {
      it(`should handle fieldsHide test case ${index + 1}`, () => {
        const result = securityToolKit.sanitizerMethods.fieldsHide(
          test.input,
          test.start,
          test.end
        );
        expect(result).toBe(test.expected);
      });
    });
  });
});
