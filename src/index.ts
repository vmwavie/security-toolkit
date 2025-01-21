import {
  PasswordComplexityInputProps,
  PasswordComplexityReturnsProps,
} from "feats/checkers/passwordValidator";
import { emailIsValid, validatePassword } from "./feats/checkers";
import { generateDeviceDataLogger, hostResolver, ipTracker } from "./feats/loggers";
import {
  HOTP_generateCode,
  HOTP_validateUserCode,
  TOTP_generateCode,
  TOTP_validateUserCode,
  decodeSecret,
  generateQRCodeURI,
  generateSecret,
} from "./feats/otp/index";
import { fieldsHide, sanitizeSQLInjection, sanitizeXSSInjection } from "./feats/sanitization";

class SecurityToolKit {
  /**
   * @property totpMethods
   * @description A collection of methods for Time-based One-Time Password (TOTP) operations.
   * TOTP is an extension of the HMAC-based One-time Password Algorithm (HOTP) that generates
   * a one-time password using a shared secret key and the current time.
   */
  totpMethods: {
    /**
     * Generates a cryptographically secure random secret key for TOTP.
     *
     * @returns {string} A randomly generated secret key encoded in Base32 format.
     *                   Typically 32 characters long (160 bits of entropy).
     *
     * @example
     * const secret = securityToolKit.totpMethods.generateSecret();
     * console.log(secret); // Outputs something like "JBSWY3DPEHPK3PXP"
     *
     * @see {@link https://tools.ietf.org/html/rfc6238|RFC 6238} for TOTP algorithm details.
     */
    generateSecret: () => string;

    /**
     * Decodes a TOTP secret key from a Base32 encoded string to a Buffer.
     *
     * @param {string} secret - The TOTP secret key as a Base32 encoded string.
     * @returns {Buffer} The decoded secret as a Buffer, ready for use in TOTP operations.
     *
     * @throws {Error} If the input is not a valid Base32 encoded string.
     *
     * @example
     * const decodedSecret = securityToolKit.totpMethods.decodeSecret("JBSWY3DPEHPK3PXP");
     * console.log(decodedSecret); // <Buffer 48 65 6c 6c 6f 21 de ad be ef>
     */
    decodeSecret: (secret: string) => Buffer;

    /**
     * Generates a QR code URI for easy TOTP secret sharing and device setup.
     *
     * @param {string} secret - The TOTP secret key, typically generated using the `generateSecret` method.
     * @param {string} companyName - The name of the company or service implementing TOTP.
     * @param {string} userName - The username or identifier for the user.
     * @returns {string} A URI that can be used to generate a QR code, following the `otpauth://` scheme.
     *
     * @example
     * const uri = securityToolKit.totpMethods.generateQRCodeURI('JBSWY3DPEHPK3PXP', 'MyCompany', 'name@example.com');
     * console.log(uri);
     * // Output: otpauth://totp/MyCompany:name@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MyCompany&algorithm=SHA1&digits=6&period=30
     *
     * @see {@link https://github.com/google/google-authenticator/wiki/Key-Uri-Format|Google Authenticator Key URI Format}
     */
    generateQRCodeURI: (secret: string, companyName: string, userName: string) => string;

    /**
     * Generates a TOTP six-digit code based on the current time.
     *
     * @param {string} secret - The TOTP secret key.
     * @returns {string} The generated six-digit TOTP code.
     *
     * @example
     * const code = securityToolKit.totpMethods.generateCode("JBSWY3DPEHPK3PXP");
     * console.log(code); // Outputs a six-digit code like "123456"
     *
     * @note The generated code is valid for a specific time window, typically 30 seconds.
     */
    generateCode: (secret: string) => string;

    /**
     * Validates a user-provided TOTP code against the secret.
     *
     * @param {string} secret - The TOTP secret key.
     * @param {string} code - The user-provided TOTP code to validate.
     * @returns {boolean} True if the code is valid within the current time window, false otherwise.
     *
     * @example
     * const isValid = securityToolKit.totpMethods.validateUserCode("JBSWY3DPEHPK3PXP", "123456");
     * console.log(isValid); // true or false
     *
     * @note The validation includes a time window to account for potential time skew between client and server.
     *       The size of this window can be configured in the constructor options.
     */
    validateUserCode: (secret: string, code: string) => boolean;
  };

  /**
   * @property hotpMethods
   * @description A collection of methods for HMAC-based One-Time Password (HOTP) operations.
   */
  hotpMethods: {
    /**
     * Generates a cryptographically secure random secret key for HOTP (HMAC-based One-Time Password).
     *
     * This method creates a new, unique secret key that can be used for HOTP authentication.
     * The secret is generated using a cryptographically secure random number generator
     * and is encoded in Base32 format for easy sharing and input.
     *
     * @returns {string} A randomly generated secret key encoded in Base32 format.
     *                   Typically 32 characters long (160 bits of entropy).
     *
     * @example
     * const secret = generateSecret();
     * console.log(secret); // Outputs something like "JBSWY3DPEHPK3PXP"
     *
     * @note This secret should be securely stored and never exposed publicly.
     *       It should be shared securely with the user during the initial setup process.
     *
     * @see {@link https://tools.ietf.org/html/rfc4226#section-4|RFC 4226 Section 4} for HOTP algorithm details.
     * @see {@link https://tools.ietf.org/html/rfc4648#section-6|RFC 4648 Section 6} for Base32 encoding details.
     */
    generateSecret: () => string;

    /**
     * Decodes an HOTP secret key from a Base32 encoded string to a Buffer.
     *
     * This method is crucial for converting the user-friendly Base32 encoded secret
     * into a format that can be used for HOTP calculations.
     *
     * @param {string} secret - The HOTP secret key as a Base32 encoded string.
     *                          This is typically the secret provided to or generated for the user.
     * @returns {Buffer} The decoded secret as a Buffer, ready for use in HOTP operations.
     *
     * @throws {Error} If the input is not a valid Base32 encoded string.
     *
     * @example
     * const encodedSecret = "JBSWY3DPEHPK3PXP";
     * const decodedSecret = decodeSecret(encodedSecret);
     * console.log(decodedSecret); // <Buffer 48 65 6c 6c 6f 21 de ad be ef>
     *
     * @note The resulting Buffer is used internally for HOTP code generation and validation.
     *       Users typically don't need to interact with this decoded form directly.
     *
     * @see {@link https://tools.ietf.org/html/rfc4648#section-6|RFC 4648 Section 6} for details on Base32 encoding.
     */
    decodeSecret: (secret: string) => Buffer;

    /**
     * Generates a QR code URI for easy HOTP secret sharing and device setup.
     *
     * This method creates a URI that can be converted into a QR code, allowing for easy
     * secret key transfer to authenticator apps or devices that support HOTP.
     *
     * @param {string} secret - The HOTP secret key, typically generated using the `generateSecret` method.
     * @param {string} companyName - The name of the company or service implementing HOTP. This will be displayed in the authenticator app.
     * @param {string} userName - The username or identifier for the user. This helps distinguish multiple accounts in the authenticator app.
     * @returns {string} A URI that can be used to generate a QR code. This URI follows the `otpauth://` scheme.
     *
     * @example
     * const uri = generateQRCodeURI('JBSWY3DPEHPK3PXP', 'MyCompany', 'name@example.com');
     * console.log(uri);
     * // Output: otpauth://hotp/MyCompany:name@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MyCompany&algorithm=SHA1&digits=6&counter=0
     *
     * @note The generated URI includes parameters such as the algorithm (SHA1), digit count (6),
     *       and initial counter value (0). These are standard for HOTP but may be customizable in future versions.
     *
     * @see {@link https://github.com/google/google-authenticator/wiki/Key-Uri-Format|Google Authenticator Key URI Format}
     *      for more information on the URI format.
     */
    generateQRCodeURI: (secret: string, companyName: string, userName: string) => string;

    /**
     * Generates an HOTP (HMAC-based One-Time Password) six-digit code based on the current counter value.
     *
     * This method implements the HOTP algorithm as defined in RFC 4226. It creates a time-based
     * one-time password using the provided secret and the current counter value.
     *
     * @param {string} secret - The HOTP secret key. This should be a shared secret between the server and the client,
     *                          typically generated using the `generateSecret` method.
     * @returns {string} A six-digit HOTP code. This code is valid for the current counter value only.
     *
     * @throws {Error} If the secret is invalid or not in the correct format.
     *
     * @example
     * const code = generateCode("JBSWY3DPEHPK3PXP");
     * console.log(code); // Outputs a six-digit code like "123456"
     *
     * @note The generated code is tied to the current counter value. Ensure that the counter
     *       is incremented after each use to maintain synchronization between client and server.
     *
     * @see {@link https://tools.ietf.org/html/rfc4226|RFC 4226} for the HOTP algorithm specification.
     */
    generateCode: (secret: string) => string;

    /**
     * Validates a user-provided HOTP (HMAC-based One-Time Password) code against the secret and current counter value.
     *
     * This method implements the HOTP algorithm as defined in RFC 4226. It compares the user-provided
     * code with a newly generated code based on the secret and the current counter value.
     *
     * @param {string} secret - The HOTP secret key. This should be a shared secret between the server and the client.
     * @param {string} code - The user-provided HOTP code to validate. This is typically a 6-digit number.
     * @returns {boolean} True if the code is valid for the current counter value (or within the allowed window), false otherwise.
     *
     * @throws {Error} If the secret is invalid or if the code is not in the correct format.
     *
     * @example
     * const isValid = validateUserCode("JBSWY3DPEHPK3PXP", "123456");
     * console.log(isValid); // true or false
     *
     * @note The validation includes a time window to account for potential desynchronization between client and server.
     *       The size of this window can be configured in the constructor options.
     *
     * @see {@link https://tools.ietf.org/html/rfc4226|RFC 4226} for the HOTP algorithm specification.
     */
    validateUserCode: (secret: string, code: string) => boolean;
  };

  /**
   * @property checkersMethods
   * @description A collection of methods for validating and checking various inputs.
   */
  checkersMethods: {
    /**
     * Evaluates the complexity and strength of a given password.
     *
     * This method analyzes the password based on several criteria:
     * - Length
     * - Presence of uppercase and lowercase letters
     * - Inclusion of numbers
     * - Use of special characters
     * - Maximum allowed consecutive identical characters
     * - Avoidance of common passwords
     *
     * @param {PasswordComplexityInputProps} props - Contains the password and optional validation parameters.
     * @returns {PasswordComplexityReturnsProps} An object containing the strength assessment and a descriptive message.
     * @property {('weak'|'medium'|'strong')} strength - The evaluated strength of the password:
     *   - 'weak': Password is easily guessable or does not meet most criteria.
     *   - 'medium': Password meets some criteria but could be stronger.
     *   - 'strong': Password meets all or most complexity criteria.
     * @property {string} message - A descriptive message about the password's strength and suggestions for improvement.
     *
     * @example
     * const result = securityToolKit.checkersMethods.passwordComplexity({
     *   password: "P@ssw0rd123",
     *   validation: {
     *     minChars: 8,
     *     maxChars: 20,
     *     minLetters: 2,
     *     minUpperCase: 1,
     *     minSymbols: 1,
     *     minNumbers: 1,
     *     maxConsecutiveChars: 2,
     *     avoidCommonPasswords: true,
     *   },
     * });
     * console.log(result);
     * // Output: { strength: "strong", message: "Password is valid." }
     *
     * @throws {Error} If the input is invalid or missing required fields.
     */
    validatePassword: (props: PasswordComplexityInputProps) => PasswordComplexityReturnsProps;

    /**
     * Validates an email address and assesses its trustworthiness.
     *
     * This method performs a two-step validation:
     * 1. Checks the email format for syntactic correctness.
     * 2. Verifies the email domain against a blacklist of known suspicious domains.
     *
     * @param {string} email - The email address to validate.
     * @returns {Promise<Object>} A promise that resolves to an object containing validation results.
     * @property {boolean} isValid - True if the email passes all validation checks.
     * @property {number} trust - A numeric value (0 to 100) indicating the email's trust level.
     *
     * @example
     * const result = await securityToolKit.checkersMethods.emailIsValid("user@example.com");
     * console.log(result); // { isValid: true, trust: 85 }
     */
    emailIsValid: (email: string) => Promise<{ isValid: boolean; trust: number }>;
  };

  /**
   * @property loggerMethods
   * @description A collection of methods for logging and tracking device and IP information.
   * These methods provide valuable insights for security analysis and user behavior tracking.
   */
  loggerMethods: {
    /**
     * Generates a comprehensive report of the current device's data.
     *
     * This asynchronous method collects various pieces of information about the device
     * and network from which the request is made, including IP address, user agent,
     * geolocation, incognito mode status, and a maliciousness score.
     *
     * @returns {Promise<Object>} A promise that resolves to an object containing device data.
     * @property {string} ip - The IP address of the device.
     * @property {string} userAgent - The user agent string of the browser or application.
     * @property {Object} geolocation - The approximate geographical location of the device.
     * @property {string|void} geolocation.long - The longitude coordinate, if available.
     * @property {string|void} geolocation.lat - The latitude coordinate, if available.
     * @property {boolean} isIncognito - Indicates whether the browser is in incognito/private mode.
     * @property {number} isMalicious - A score from 0.0 to 1.0 indicating the likelihood of malicious intent.
     *                                  Higher values suggest higher risk.
     *
     * @example
     * const deviceData = await securityToolKit.loggerMethods.generateDeviceDataLogger();
     * console.log(deviceData);
     * // Output:
     * // {
     * //   ip: "203.0.113.195",
     * //   userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
     * //   geolocation: { long: "-122.4194", lat: "37.7749" },
     * //   isIncognito: false,
     * //   isMalicious: 1
     * // }
     *
     * @note The accuracy of geolocation data may vary and is typically based on IP address.
     * @note This method is designed to work in a frontend environment.
     * @note The maliciousness score is determined by various factors and should be used as a guideline, not a definitive assessment.
     */
    generateDeviceDataLogger: () => Promise<{
      ip: string;
      userAgent: string;
      geolocation: {
        long: string | void;
        lat: string | void;
      };
      isIncognito: boolean;
      isMalicious: number;
    }>;

    /**
     * Tracks and retrieves detailed information about a given IP address using the ipinfo.io API.
     *
     * This asynchronous method queries the ipinfo.io service to gather
     * comprehensive information about the provided IP address, including its
     * geolocation and associated network details. It is designed to be used in a backend environment.
     *
     * @param {string} ip - The IP address to track and analyze.
     * @returns {Promise<Object>} A promise that resolves to an object containing IP information.
     * @property {string} ip - The queried IP address.
     * @property {string|void} privacy - Privacy information about the IP address, if available.
     * @property {Object} geolocation - The approximate geographical location associated with the IP.
     * @property {string|void} geolocation.long - The longitude coordinate, if available.
     * @property {string|void} geolocation.lat - The latitude coordinate, if available.
     * @property {string|void} hostname - The hostname associated with the IP address, if available.
     * @property {string|void} city - The city associated with the IP address, if available.
     * @property {string|void} region - The region or state associated with the IP address, if available.
     * @property {string|void} country - The country associated with the IP address, if available.
     *
     * @example
     * // In a Node.js backend environment:
     * const securityToolKit = new SecurityToolKit({ API_KEYS: { ipInfoKey: 'your_ipinfo_api_key' } });
     * const ipInfo = await securityToolKit.loggerMethods.ipTracker("203.0.113.195");
     * console.log(ipInfo);
     * // Output:
     * // {
     * //   ip: "203.0.113.195",
     * //   privacy: "unknown",
     * //   geolocation: { long: "-122.4194", lat: "37.7749" },
     * //   hostname: "example-isp.com",
     * //   city: "San Francisco",
     * //   region: "California",
     * //   country: "US"
     * // }
     *
     * @note This method is designed to work in a backend environment and requires Node.js.
     * @note It uses the ipinfo.io API, which requires an API key. Ensure you provide a valid ipInfoKey in the constructor options.
     * @note The accuracy and availability of information may vary depending on the IP address and the data provided by ipinfo.io.
     * @note Be aware of ipinfo.io's usage limits and terms of service when using this method.
     */
    ipTracker: (ip: string) => Promise<{
      ip: string;
      geolocation: {
        long: string | void;
        lat: string | void;
      };
      hostname: string | void;
      city: string | void;
      region: string | void;
      country: string | void;
    }>;

    /**
     * Resolves a given hostname to its IP address using the DNS protocol.
     *
     * This asynchronous method attempts to resolve the specified hostname to an IP address.
     * It performs multiple attempts based on the provided retry count and waits for a specified
     * timeout duration between each attempt.
     *
     * @param {string} hostname - The hostname to resolve.
     * @param {number} retries - The number of attempts to resolve the hostname.
     * @param {number} timeout - The timeout in milliseconds for each request to resolve the hostname.
     * @returns {Promise<Object>} A promise that resolves to an object containing the resolution status.
     * @property {string|null} error_message - An error message if the resolution fails, otherwise null.
     * @property {boolean} status - Indicates whether the hostname was successfully resolved.
     *
     * @example
     * const result = await securityToolKit.loggerMethods.hostResolver("example.com", 3, 1000);
     * console.log(result);
     * // Output: { error_message: null, status: true }
     *
     * @note This method is useful for network diagnostics and troubleshooting.
     * @note Ensure that the DNS server is reachable and responsive to avoid unnecessary retries.
     */
    hostResolver: (
      hostname: string,
      retries: number,
      timeout: number
    ) => Promise<{
      error_message: string | null;
      status: boolean;
    }>;
  };

  /**
   * @property sanitizerMethods
   * @description A collection of methods for sanitizing and securing input data.
   * These methods help prevent common security vulnerabilities such as XSS and SQL injection.
   */
  sanitizerMethods: {
    /**
     * Sanitizes input to prevent Cross-Site Scripting (XSS) attacks.
     *
     * This method processes the input string to remove or escape potentially dangerous
     * HTML and JavaScript content that could be used for XSS attacks.
     *
     * @param {string} input - The input string to be sanitized.
     * @returns {Object} An object containing the sanitized string and a danger indicator.
     * @property {string} sanitized - The sanitized version of the input string.
     * @property {boolean} isDangerous - Indicates whether the original input was potentially dangerous.
     *
     * @example
     * const result = securityToolKit.sanitizerMethods.sanitizeXSSInjection("<script>alert('XSS')</script>");
     * console.log(result);
     * // Output: { sanitized: "&lt;script&gt;alert('XSS')&lt;/script&gt;", isDangerous: true }
     */
    sanitizeXSSInjection: (input: string) => {
      sanitized: string;
      isDangerous: boolean;
    };

    /**
     * Sanitizes input to prevent SQL Injection attacks.
     *
     * This method processes the input string to remove or escape characters and patterns
     * that could be used for SQL injection attacks.
     *
     * @param {string} input - The input string to be sanitized.
     * @returns {Object} An object containing the sanitized string and a danger indicator.
     * @property {string} sanitized - The sanitized version of the input string.
     * @property {boolean} isDangerous - Indicates whether the original input was potentially dangerous.
     *
     * @example
     * const result = securityToolKit.sanitizerMethods.sanitizeSQLInjection("SELECT * FROM users WHERE id = 1 OR 1=1");
     * console.log(result);
     * // Output: { sanitized: "SELECT * FROM users WHERE id = 1 OR 1\\=1", isDangerous: true }
     */
    sanitizeSQLInjection: (input: string) => {
      sanitized: string;
      isDangerous: boolean;
    };

    /**
     * Hides a portion of a string by replacing characters with asterisks.
     *
     * This method is useful for masking sensitive information such as credit card numbers
     * or social security numbers.
     *
     * @param {string} str - The input string to be partially hidden.
     * @param {number} start - The starting index of the portion to hide (inclusive).
     * @param {number} end - The ending index of the portion to hide (exclusive).
     * @returns {string} The input string with the specified portion replaced by asterisks.
     *
     * @example
     * const maskedString = securityToolKit.sanitizerMethods.fieldsHide("1234567890", 4, 8);
     * console.log(maskedString);
     * // Output: "1234••••90"
     */
    fieldsHide: (str: string, start: number, end: number) => string;
  };

  constructor(
    { TOTP = { timeStep: 30, window: 30 } }: { TOTP?: { timeStep: number; window: number } } = {},
    { HOTP = { counter: 0, window: 1 } }: { HOTP?: { counter: number; window: number } } = {},
    { API_KEYS = { ipInfoKey: "" } }: { API_KEYS?: { ipInfoKey: string } } = {}
  ) {
    const totpMethods = {
      generateSecret: () => generateSecret(),
      decodeSecret: (secret: string) => decodeSecret(secret),
      generateQRCodeURI: (secret: string, companyName: string, userName: string) =>
        generateQRCodeURI(secret, companyName, userName, "totp"),
      generateCode: (secret: string) => TOTP_generateCode(secret, TOTP.timeStep, false),
      validateUserCode: (secret: string, code: string) =>
        TOTP_validateUserCode(secret, code, TOTP.timeStep, TOTP.window),
    };

    const hotpMethods = {
      generateSecret: () => generateSecret(),
      decodeSecret: (secret: string) => decodeSecret(secret),
      generateQRCodeURI: (secret: string, companyName: string, userName: string) =>
        generateQRCodeURI(secret, companyName, userName, "hotp"),
      generateCode: (secret: string) => HOTP_generateCode(secret, HOTP.counter),
      validateUserCode: (secret: string, code: string) =>
        HOTP_validateUserCode(secret, code, HOTP.counter, HOTP.window),
    };

    const checkersMethods = {
      validatePassword: (props: PasswordComplexityInputProps) => validatePassword(props),
      emailIsValid: async (email: string) => await emailIsValid(email),
    };

    const loggerMethods = {
      generateDeviceDataLogger: async () => await generateDeviceDataLogger(),
      ipTracker: async (ip: string) => await ipTracker(ip, API_KEYS.ipInfoKey),
      hostResolver: async (hostname: string, retries: number, timeout: number) =>
        await hostResolver(hostname, retries, timeout),
    };

    const sanitizerMethods = {
      sanitizeSQLInjection: (input: string) => sanitizeSQLInjection(input),
      sanitizeXSSInjection: (input: string) => sanitizeXSSInjection(input),
      fieldsHide: (str: string, start: number, end: number) => fieldsHide(str, start, end),
    };

    this.totpMethods = totpMethods;
    this.hotpMethods = hotpMethods;
    this.checkersMethods = checkersMethods;
    this.loggerMethods = loggerMethods;
    this.sanitizerMethods = sanitizerMethods;
  }
}

export default SecurityToolKit;
