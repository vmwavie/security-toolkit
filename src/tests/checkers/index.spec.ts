import SecurityToolKit from "../../index";
import { blackListEmails, validEmails } from "./constants";

describe("email checker", () => {
  let toolkit: SecurityToolKit;

  beforeEach(() => {
    toolkit = new SecurityToolKit({}, {});
  });

  test("should validate if the email is valid", async () => {
    blackListEmails.map(async (value: string) => {
      const validateEmail = await toolkit.checkersMethods.emailIsValid(value);
      console.log("valid: " + validateEmail);
      expect(validateEmail.isValid).toBe(false);
    });

    validEmails.map(async (value: string) => {
      const validateEmail = await toolkit.checkersMethods.emailIsValid(value);
      expect(validateEmail.isValid).toBe(true);
    });
  });
});
