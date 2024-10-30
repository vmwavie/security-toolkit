<p align="center">
  <!-- <img width="96px" src="https://raw.githubusercontent.com/vmwavie/security-toolkit/refs/heads/main/.github/assets/security-toolkit.svg" /> -->
  <img width="256px" src="./.github/assets/security-toolkit.svg" />
  <h1 align="center">Security Toolkit</h1>
</p>

> This library is a package of security tools for your application. It is currently in the development phase. You can find out more about this in [TODO](https://github.com/vmwavie/security-toolkit/blob/main/.github/docs/TODO.md). It will soon be open for contributions and will have more authentication and security options, such as protection for inputs containing XSS and other types of content injection in files, etc.

## Initial Setup

#### First, you need to install the package using the command:

```bash
 npm i security-toolkit # or pnpx, bunx, yarn dlx, etc.
```

#### After installation, you should initialize the library in your project:

#### Typescript:

```ts
import SecurityToolKit from "security-toolkit";

// configurations can be found in more detail in the WIKI.
const securityToolkit = new SecurityToolKit({
  TOTP: {
    window: 30,
    timeStep: 30,
  },
});
```

#### Javascript:

```js
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const SecurityToolKit = require("security-toolkit").default;

// configurations can be found in more detail in the WIKI.
const securityToolkit = new SecurityToolKit({
  TOTP: {
    window: 30,
    timeStep: 30,
  },
});
```

## Wiki

- TOTP : [github](https://github.com/vmwavie/security-toolkit/blob/main/.github/docs/features/TOTP.md)

#### more features coming soon...

#### You can view the license for this code [here](https://raw.githubusercontent.com/vmwavie/security-toolkit/refs/heads/main/LICENSE.md).
