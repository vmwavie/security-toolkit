export interface RegexValidators {
  countLetters: (password: string) => number;
  countUpperCase: (password: string) => number;
  countSymbols: (password: string) => number;
  countNumbers: (password: string) => number;
  countConsecutiveCharacters: (password: string) => number;
  checkCommonPasswords: (password: string) => boolean;
}

// minChars e maxChars são obrigatórios caso "validation" seja fornecido
// Outras validações são opcionais
export type PasswordComplexityValidation = {
  minChars: number;
  maxChars: number;
  minLetters?: number;
  minUpperCase?: number;
  minSymbols?: number;
  minNumbers?: number;
  maxConsecutiveChars?: number;
  avoidCommonPasswords?: boolean;
};

export interface PasswordComplexityInputProps {
  password: string;
  validation?: PasswordComplexityValidation;
}

export interface PasswordComplexityReturnsProps {
  isValid: boolean;
  strength?: "weak" | "medium" | "strong";
  message: string;
}

const defaultRegexValidators: RegexValidators = {
  countLetters: password => (password.match(/[a-zA-Z]/g) || []).length,
  countUpperCase: password => (password.match(/[A-Z]/g) || []).length,
  countSymbols: password => (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length,
  countNumbers: password => (password.match(/[0-9]/g) || []).length,
  countConsecutiveCharacters: password => {
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
  },
  checkCommonPasswords: password => {
    const commonPasswords = require("../../database/common-passwords.json");
    return commonPasswords.includes(password);
  },
};

// Function to calculate password strength based on met criteria
export function calculateStrength(
  validation: PasswordComplexityValidation,
  messages: string[],
  password: string
): "weak" | "medium" | "strong" {
  // Extract minimum and maximum character limits
  const { minChars, maxChars } = validation;

  // Calculate criteria scores
  const criteriaScore = calculateCriteriaScore(validation, messages);
  const lengthScore = calculateLengthScore(password, minChars, maxChars);

  // Combine scores with defined weights
  const weights = {
    criteria: 0.7, // 70% weight for meeting validation criteria
    length: 0.3, // 30% weight for password length
  };

  const totalScore = criteriaScore * weights.criteria + lengthScore * weights.length;

  // Map the score to a strength category
  return determineStrength(totalScore);
}

// Calculate the score based on met and total validation criteria
function calculateCriteriaScore(
  validation: PasswordComplexityValidation,
  messages: string[]
): number {
  const totalCriteria = Object.keys(validation).length;
  const metCriteria = totalCriteria - messages.length;
  return metCriteria / totalCriteria;
}

// Calculate a score for password length
function calculateLengthScore(password: string, minChars: number, maxChars: number): number {
  const length = password.length;

  if (length >= minChars && length <= maxChars) {
    return 1; // Full score for length within the range
  } else if (length < minChars) {
    return length / minChars; // Partial score if too short
  } else {
    return maxChars / length; // Partial score if too long
  }
}

// Determine the strength category based on the total score
function determineStrength(totalScore: number): "weak" | "medium" | "strong" {
  if (totalScore >= 0.75) {
    return "strong";
  } else if (totalScore >= 0.5) {
    return "medium";
  } else {
    return "weak";
  }
}

// Main function to validate the password
export function validatePassword(
  input: PasswordComplexityInputProps,
  regexValidators: RegexValidators = defaultRegexValidators
): PasswordComplexityReturnsProps {
  const { password, validation } = input;

  if (!password) {
    throw new Error("Password is required.");
  }

  if (validation) {
    const {
      minChars,
      maxChars,
      minLetters,
      minUpperCase,
      minSymbols,
      minNumbers,
      maxConsecutiveChars,
      avoidCommonPasswords,
    } = validation;

    if (minChars === undefined || maxChars === undefined) {
      throw new Error("minChars and maxChars are required when validation is provided.");
    }

    const messages: string[] = [];

    // Validate password length
    if (password.length < minChars) {
      messages.push(`Password must be at least ${minChars} characters long.`);
    }
    if (password.length > maxChars) {
      messages.push(`Password must not exceed ${maxChars} characters.`);
    }

    // Validate letters
    const letterCount = regexValidators.countLetters(password);
    if (minLetters !== undefined && letterCount < minLetters) {
      messages.push(`Password must contain at least ${minLetters} letter(s).`);
    }

    // Validate uppercase letters
    const upperCaseCount = regexValidators.countUpperCase(password);
    if (minUpperCase !== undefined && upperCaseCount < minUpperCase) {
      messages.push(`Password must contain at least ${minUpperCase} uppercase letter(s).`);
    }

    // Validate symbols
    const symbolCount = regexValidators.countSymbols(password);
    if (minSymbols !== undefined && symbolCount < minSymbols) {
      messages.push(`Password must contain at least ${minSymbols} symbol(s).`);
    }

    // Validate numbers
    const numberCount = regexValidators.countNumbers(password);
    if (minNumbers !== undefined && numberCount < minNumbers) {
      messages.push(`Password must contain at least ${minNumbers} number(s).`);
    }

    // Validate consecutive characters
    const maxConsecutive = regexValidators.countConsecutiveCharacters(password);
    if (maxConsecutiveChars !== undefined && maxConsecutive > maxConsecutiveChars) {
      messages.push(
        `Password must not contain more than ${maxConsecutiveChars} consecutive identical characters.`
      );
    }

    // Validate common passwords
    if (avoidCommonPasswords && regexValidators.checkCommonPasswords(password)) {
      messages.push("Password is too common and easily guessable.");
    }

    // Calculate password strength
    const strength = calculateStrength(validation, messages, password);

    return {
      isValid: messages.length === 0,
      strength,
      message: messages.length > 0 ? messages.join(" ") : "Password is valid.",
    };
  }

  // Return for cases without validation
  return {
    isValid: true,
    message: "Password is valid.",
  };
}
