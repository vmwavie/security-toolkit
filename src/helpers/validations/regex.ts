const SQL_FILTER_REGEX =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|TABLE|FROM|WHERE|AND|OR|UNION|JOIN|INNER|OUTER|LEFT|RIGHT|HAVING|GROUP|ORDER|LIMIT|OFFSET|TOP|DISTINCT|INTO|VALUES|SET|EXEC|EXECUTE|SP_|XP_)\b|--|;|\/\*|\*\/)/i;

const BUFFER_XSS_REGEX = /(%[0-9A-F]{2}|\\x[0-9A-F]{2}|\\u[0-9A-F]{4}|\\[0-7]{1,3})/i;

const JS_REGEX =
  /(%[0-9A-F]{2}|\\x[0-9A-F]{2}|\\u[0-9A-F]{4}|\\[0-7]{1,3}|<\s*script\b[^>]*>|<\s*\/\s*script\s*>|on\w+\s*=\s*['"]|['"]\s*>\s*|<\s*a\s+[^>]*href\s*=\s*['"]\s*javascript:|<\s*img\s+[^>]*src\s*=\s*['"]\s*javascript:)/gi;

const ALPHABET_REGEX = /^[a-zA-ZÀ-ú%^&*]+$/;

const VALIDATIONS_REGEX = {
  SQL_FILTER_REGEX,
  BUFFER_XSS_REGEX,
  JS_REGEX,
  ALPHABET_REGEX,
};

export default VALIDATIONS_REGEX;
