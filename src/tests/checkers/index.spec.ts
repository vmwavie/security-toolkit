import SecurityToolKit from "../../index";
import { passwordsWeak, passwordsMedium, passwordsStrong } from "./constants";

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
});
