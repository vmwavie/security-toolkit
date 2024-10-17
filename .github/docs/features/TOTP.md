[<](https://github.com/vmwavie/security-toolkit/blob/main/README.md)

## TOTP WIKI

> There are some things we can consider as best practices when using TOTP, one of them is to save the shared key in an encrypted form in the database. The lib only generates it, so it's important that you encrypt it when saving it in your database. Soon the lib will have cryptography features, but for now, you can use a lib that enables crypto, like bcrypt for example. This way, if your database suffers a leak, the two-step key will still be protected.

### Initial Setup

#### First, you should configure when importing the lib. Below are the configurations exclusively for this module:

```ts
import SecurityToolKit from "security-toolkit";
const securityToolkit = new SecurityToolKit({
  TOTP: {
    window: 30,, // (VALUE IN SECONDS) - Here you define the validation window time. For example, if your user sends the key 000-000 at 10:00:10am and your server is overloaded, it will only be able to process at 10:00:40am. The key would become invalid, but we have a 30s margin before and after the code is sent, thus maintaining the UX.
    timeStep: 30, // (VALUE IN SECONDS) - Here you define the time in which the application will act. Following RFC-6749, the default time is 30s. However, if you have your own code generation application, for example, you can change this margin and use the timeStep as needed.
  },
});
```

### Functionalities

#### Generating shared-key:

```ts
securityToolkit.generateSecret();
// This function will return a 24-character string, which is the code shared between the server and the user for six-code validation.
```

#### Decoding the shared-key to buffer:

```ts
securityToolkit.decodeSecret("CRNS4Q5AH4GJYGYV2AEIBPWE");
// This function will receive the shared-key. Here I used the shared-key CRNS4Q5AH4GJYGYV2AEIBPWE, but you should replace it with yours. It will return a Buffer containing the shared-key returned to the Buffer format.
```

#### Generating six-digit code:

```ts
securityToolkit.generateCode("CRNS4Q5AH4GJYGYV2AEIBPWE");
// This function will receive the shared-key. Here I used the shared-key CRNS4Q5AH4GJYGYV2AEIBPWE, but you should replace it with yours. It will return a six-digit code. It can be used in an authentication application to generate codes that the user will use to authenticate to the system.
```

#### Validating code sent by the user:

```ts
securityToolkit.validateUserCode("CRNS4Q5AH4GJYGYV2AEIBPWE", "000111");
// This function will receive the shared-key. Here I used the shared-key CRNS4Q5AH4GJYGYV2AEIBPWE, but you should replace it with yours. It also receives the six-digit code sent by the user. Here I used "000111", but you should replace it with yours. It will internally generate a six-digit code using the shared key and will use the value defined in WINDOW as a validation margin. It will return true if the code the user sent is valid and false if the code the user sent is invalid.
```

#### Generating URI-0auth for use in QR code (for you to display the QR code and the user to open in their auth app):

```ts
securityToolkit.generateQRCodeURI("CRNS4Q5AH4GJYGYV2AEIBPWE", "github", "vmwavie");
// This function will receive the shared-key. Here I used the shared-key CRNS4Q5AH4GJYGYV2AEIBPWE, but you should replace it with yours. It also receives the name of your company and the user's name. In this example, I used the company name as github and the username as vmwavie. It will return a link, for example "otpauth://totp/vmwavie?secret=CRNS4Q5AH4GJYGYV2AEIBPWE&issuer=github". You can put this link in a QR code and display it to the user. When scanned, the code will be automatically added to the user's authentication application.
```
