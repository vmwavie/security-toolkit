declare function generateSecret(): string;
declare function decodeSecret(secret: string): Buffer;
declare function generateCode(secret: string, timeStep: number, haveWindow: boolean): string;
declare function validateUserCode(secret: string, code: string, timeStepBase: number, windowSize: number): boolean;
declare function generateQRCodeURI(secret: string, companyName: string, userName: string): string;
export { generateSecret, decodeSecret, generateCode, generateQRCodeURI, validateUserCode };
