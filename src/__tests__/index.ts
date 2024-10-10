import SecurityToolKit from "../index";

const securityToolKit = new SecurityToolKit({ TOTP: { timeStep: 30, window: 30 } });

const secretKey = securityToolKit.generateSecret();
console.log("Secret Key:", secretKey);
const userCode = securityToolKit.generateCode(secretKey);
console.log("User Code:", userCode);
const validateUserCode = securityToolKit.validateUserCode(secretKey, userCode);
console.log("User Code Validation:", validateUserCode);
