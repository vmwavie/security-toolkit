import { Constructor } from "./totp/types/index";
declare class SecurityToolKit {
    /**
     * The default time step for the TOTP algorithm, in seconds. The default is 30 seconds, but it can be adjusted if needed.
     * For more information, see https://datatracker.ietf.org/doc/html/rfc6238#section-4.1
     */
    private timeStep;
    /**
     * The time window during which a code is considered valid. The default is 30 seconds, but it can be adjusted if needed.
     * The window allows for some flexibility in code validation, accounting for potential processing delays.
     */
    private window;
    /**
     * Generates a secret key for TOTP.
     *
     * @return {string} The generated secret key.
     */
    generateSecret: () => string;
    /**
     * Decodes a TOTP secret key to its original Buffer format.
     *
     * @param {string} secret The secret key to be decoded.
     * @returns {Buffer} The decoded secret key.
     */
    decodeSecret: (secret: string) => Buffer;
    /**
     * Generates a one-time password (TOTP) code.
     *
     * @param {string} secret The secret key used to generate the code.
     * @returns {string} The generated one-time password (TOTP) code.
     */
    generateCode: (secret: string) => string;
    /**
     * Generates a QR code URI containing the secret key, which can be used in a QR code reader app like Google Authenticator.
     *
     * @param {string} secret The secret key to generate the QR code URI.
     * @param {string} companyName The name of the company to display in the authenticator (e.g., company: username@email.com).
     * @param {string} userName The username to display in the authenticator (e.g., username).
     * @returns {string} The generated QR code URI.
     */
    generateQRCodeURI: (secret: string, companyName: string, userName: string) => string;
    /**
     * Validates whether a user-provided code is valid.
     *
     * @param {string} secret The secret key used to validate the code.
     * @param {string} code The code provided by the user to be validated.
     * @returns {boolean} True if the code is valid, otherwise false. The provided window time is considered around the current time step for validation.
     */
    validateUserCode: (secret: string, code: string) => boolean;
    /**
     * Constructs a new instance of the SecurityToolKit class with optional configuration for TOTP settings.
     *
     * @param {Object} config - Configuration object for TOTP settings.
     * @param {Object} config.TOTP - TOTP configuration settings.
     * @param {number} [config.TOTP.timeStep=30] - The time step in seconds for the TOTP algorithm. Defaults to 30 seconds.
     * @param {number} [config.TOTP.window=30] - The time window in seconds during which a code is considered valid. Defaults to 30 seconds.
     */
    constructor({ TOTP: { timeStep, window } }: Constructor);
}
export default SecurityToolKit;