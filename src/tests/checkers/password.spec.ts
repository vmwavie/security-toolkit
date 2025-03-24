import { RegexValidators, validatePassword } from "../../feats/checkers/passwordValidator";

describe("password checker", () => {
  const mockRegexValidators: RegexValidators = {
    countLetters: jest.fn((password: string) => (password.match(/[a-zA-Z]/g) || []).length),
    countUpperCase: jest.fn((password: string) => (password.match(/[A-Z]/g) || []).length),
    countSymbols: jest.fn(
      (password: string) => (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length
    ),
    countNumbers: jest.fn((password: string) => (password.match(/[0-9]/g) || []).length),
    countConsecutiveCharacters: jest.fn((password: string) => {
      let maxStreak = 0;
      let currentStreak = 1;
      for (let i = 1; i < password.length; i++) {
        if (password[i] === password[i - 1]) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      return maxStreak;
    }),
    checkCommonPasswords: jest.fn((password: string) =>
      ["123456", "password", "123456789"].includes(password)
    ),
  };

  it("should throw an error if password is not provided", () => {
    expect(() =>
      validatePassword({ password: "", validation: { minChars: 3, maxChars: 10 } })
    ).toThrow("Password is required.");
  });

  it("should validate successfully when all criteria are met", () => {
    const result = validatePassword(
      {
        password: "Passw0rd!",
        validation: {
          minChars: 8,
          maxChars: 20,
          minLetters: 2,
          minUpperCase: 1,
          minSymbols: 1,
          minNumbers: 1,
          maxConsecutiveChars: 2,
          avoidCommonPasswords: true,
        },
      },
      mockRegexValidators
    );

    expect(result.isValid).toBe(true);
    expect(result.strength).toBe("strong");
    expect(result.message).toBe("Password is valid.");
  });

  it("should return error messages for unmet criteria", () => {
    const result = validatePassword(
      {
        password: "password",
        validation: {
          minChars: 8,
          maxChars: 20,
          minLetters: 2,
          minUpperCase: 1,
          minSymbols: 1,
          minNumbers: 1,
          maxConsecutiveChars: 2,
          avoidCommonPasswords: true,
        },
      },
      mockRegexValidators
    );

    expect(result.isValid).toBe(false);
    expect(result.message).toContain("Password must contain at least 1 uppercase letter(s).");
    expect(result.message).toContain("Password must contain at least 1 symbol(s).");
    expect(result.message).toContain("Password must contain at least 1 number(s).");
    expect(result.message).toContain("Password is too common and easily guessable.");
  });

  it("should handle consecutive characters validation", () => {
    const result = validatePassword(
      {
        password: "aaaBBB111",
        validation: {
          minChars: 8,
          maxChars: 20,
          maxConsecutiveChars: 2,
        },
      },
      mockRegexValidators
    );

    expect(result.isValid).toBe(false);
    expect(result.message).toContain(
      "Password must not contain more than 2 consecutive identical characters."
    );
  });

  it("should correctly calculate password strength based on validation criteria", () => {
    const resultWeak = validatePassword(
      {
        password: "pass", // Não atende ao critério de maiúsculas, números e símbolos
        validation: {
          minChars: 6, // Atendido, porque o comprimento é igual a 8
          maxChars: 20, // Atendido, porque o comprimento é menor que 20
          minLetters: 3, // Atendido, pois contém mais de 2 letras
          minUpperCase: 1, // Não atendido, pois não contém letras maiúsculas
          minSymbols: 1, // Não atendido, pois não contém símbolos
          minNumbers: 1, // Não atendido, pois não contém números
        },
      },
      mockRegexValidators
    );

    expect(resultWeak.strength).toBe("weak");
    expect(resultWeak.isValid).toBe(false);

    const resultMedium = validatePassword(
      {
        password: "P@ssword", // Não tem símbolos, mas atende a outros critérios
        validation: {
          minChars: 9, // Atendido, comprimento >= 8
          maxChars: 20, // Atendido, comprimento <= 20
          minLetters: 2, // Atendido, tem mais de 2 letras
          minUpperCase: 1, // Atendido, tem pelo menos uma letra maiúscula
          minSymbols: 1, // Não atendido, não tem símbolos
          minNumbers: 1, // Atendido, tem pelo menos um número
        },
      },
      mockRegexValidators
    );

    expect(resultMedium.strength).toBe("medium");
    expect(resultMedium.isValid).toBe(false);
  });

  it("should use custom regex validators", () => {
    const customValidators: RegexValidators = {
      ...mockRegexValidators,
      countSymbols: jest.fn((password: string) => (password.match(/[#$%^]/g) || []).length),
    };

    const result = validatePassword(
      {
        password: "Test#Password",
        validation: {
          minChars: 8,
          maxChars: 20,
          minSymbols: 1,
        },
      },
      customValidators
    );

    expect(customValidators.countSymbols).toHaveBeenCalled();
    expect(result.isValid).toBe(true);
  });
});
