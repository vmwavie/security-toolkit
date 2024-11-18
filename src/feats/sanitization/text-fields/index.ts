import SANITIZATION_PATTERNS from "../../../helpers/validations/patterns";
import VALIDATIONS_REGEX from "../../../helpers/validations/regex";

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

  if (VALIDATIONS_REGEX.JS_REGEX.test(input)) {
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
    isDangerous: input !== sanitizedInput ? true : false,
  };
}

function sanitizeSQLInjection(input: string): {
  sanitized: string;
  isDangerous: boolean;
} {
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

function fieldsHide(str: string, start: number, end: number): string {
  if (start < 0 || end > str.length || start >= end) {
    return str;
  }

  return str.slice(0, start) + "•".repeat(end - start) + str.slice(end);
}

export { sanitizeSQLInjection, sanitizeXSSInjection, fieldsHide };
