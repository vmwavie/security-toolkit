import SecurityToolKit from "../../index";
import {
  passwordsWeak,
  passwordsMedium,
  passwordsStrong,
  validEmails,
  blackListEmails,
} from "./constants";

describe("checkers", () => {
  let toolkit: SecurityToolKit;

  beforeEach(() => {
    toolkit = new SecurityToolKit({}, {});
  });

  test("should check password complexity", () => {
    passwordsWeak.map((value: string) => {
      const caseOne = toolkit.checkersMethods.passwordComplexity(value);
      expect(caseOne.strength).toBe("weak");
    });

    passwordsMedium.map((value: string) => {
      const caseTwo = toolkit.checkersMethods.passwordComplexity(value);
      expect(caseTwo.strength).toBe("medium");
    });

    passwordsStrong.map((value: string) => {
      const caseThree = toolkit.checkersMethods.passwordComplexity(value);
      expect(caseThree.strength).toBe("strong");
    });
  });

  test("should validate if the email is valid", async () => {
    blackListEmails.map(async (value: string) => {
      const validateEmail = await toolkit.checkersMethods.emailIsValid(value);
      console.log("valid: " + validateEmail);
      expect(validateEmail.isValid).toBe(false);
    });

    // validEmails.map(async (value: string) => {
    //   const validateEmail = await toolkit.checkersMethods.emailIsValid(value);
    //   expect(validateEmail.isValid).toBe(true);
    // });
  });
});
