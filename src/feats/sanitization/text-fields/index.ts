import SANITIZATION_PATTERNS from "helpers/validations/patterns";
import VALIDATIONS_REGEX from "helpers/validations/regex";

function sanitizeXSSInjection(input: string): {
  sanitized: string;
  isDangerous: boolean;
} {
  if (VALIDATIONS_REGEX.BUFFER_XSS_REGEX.test(input)) {
    return {
      sanitized: "",
      isDangerous: true,
    };
  }

  if (!VALIDATIONS_REGEX.ALPHABET_REGEX.test(input)) {
    return {
      sanitized: "",
      isDangerous: true,
    };
  }

  let sanitizedInput = input;

  SANITIZATION_PATTERNS.JS.forEach(({ pattern, replacement }) => {
    sanitizedInput = sanitizedInput.replace(pattern, replacement);
  });

  return {
    sanitized: sanitizedInput,
    isDangerous: false,
  };
}

function sanitizeSQLInjection(input: string): {
  sanitized: string;
  isDangerous: boolean;
} {
  if (sanitizeXSSInjection(input).isDangerous) {
    return {
      sanitized: "",
      isDangerous: true,
    };
  }

  if (VALIDATIONS_REGEX.SQL_FILTER_REGEX.test(input)) {
    return {
      sanitized: "",
      isDangerous: true,
    };
  }

  let sanitizedInput = input;

  SANITIZATION_PATTERNS.SQL.forEach(({ pattern, replacement }) => {
    sanitizedInput = sanitizedInput.replace(pattern, replacement);
  });

  return {
    sanitized: sanitizedInput,
    isDangerous: false,
  };
}

export { sanitizeSQLInjection };