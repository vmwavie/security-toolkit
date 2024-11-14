import path from "path";
import fs from "fs";
import axios from "axios";

async function isMaliciousUser(userAgent: string): Promise<number> {
  let score = 0;

  const isFriendlyBot = (userAgent: string) => {
    const userAgentsPath = path.resolve(process.cwd(), "src/helpers/blacklists/user-agents.json");
    const data = fs.readFileSync(userAgentsPath, "utf-8");
    const userAgents = JSON.parse(data);

    for (const agent of userAgents) {
      if (agent.instances.includes(userAgent)) {
        return true;
      }
    }

    return false;
  };

  const _humanInterationType = async (userAgent: string) => {
    let interacted = false;

    window.addEventListener("mousemove", () => (interacted = true));
    window.addEventListener("keydown", () => (interacted = true));
    window.addEventListener("scroll", () => (interacted = true));
    window.addEventListener("click", () => (interacted = true));

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(interacted);
      }, 3000);
    });
  };

  const isHeadlessBrowser =
    !navigator.webdriver ||
    navigator.plugins.length === 0 ||
    !navigator.languages ||
    /HeadlessChrome/.test(navigator.userAgent);

  const humanInterationType = await _humanInterationType(userAgent);

  if (isFriendlyBot(userAgent)) {
    score = 0.5;
  } else if (isHeadlessBrowser && !humanInterationType) {
    score = 1.0;
  } else if (humanInterationType) {
    score = 0;
  }

  return score;
}

async function generateDeviceDataLogger(): Promise<{
  ip: string;
  userAgent: string;
  geolocation: {
    long: string | void;
    lat: string | void;
  };
  isIncognito: boolean;
  isMalicious: number;
}> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    throw new Error("This function must be run in a browser environment.");
  }

  const quota = await navigator.storage.estimate();
  const ipFetch = await axios.get("https://api.ipify.org?format=json");
  const ipData = ipFetch.data;

  return {
    ip: ipData.ip,
    userAgent: navigator.userAgent,
    geolocation: {
      long:
        "geolocation" in navigator
          ? navigator.geolocation.getCurrentPosition(
              position => position.coords.longitude,
              error => console.error(error)
            )
          : "unknown",
      lat:
        "geolocation" in navigator
          ? navigator.geolocation.getCurrentPosition(
              position => position.coords.latitude,
              error => console.error(error)
            )
          : "unknown",
    },
    isIncognito: quota.quota !== undefined ? (quota.quota < 120000000 ? true : false) : false,
    isMalicious: await isMaliciousUser(navigator.userAgent),
  };
}
async function ipTracker(_ip: string = ""): Promise<{
  ip: string;
  geolocation: {
    long: string | void;
    lat: string | void;
  };
  hostname: string | void;
  city: string | void;
  region: string | void;
  country: string | void;
}> {
  let ip: string = _ip;

  if (_ip === "") {
    const ipFetch = await axios.get("https://api.ipify.org?format=json");
    const ipData = ipFetch.data;
    ip = ipData.ip;
  }

  let geolocation = { long: "unknown", lat: "unknown" };
  let hostname = "unknown";
  let city = "unknown";
  let region = "unknown";
  let country = "unknown";

  // to-do convert to axios
  const ipInfoFetch = async (url: string) => {
    return new Promise<string>((resolve, reject) => {
      const exec = require("child_process").exec;
      exec(`curl -s ${url}`, (error: any, stdout: any, stderr: any) => {
        if (error) {
          reject(`Error: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
  };

  const ipInfoData = JSON.parse(await ipInfoFetch(`https://ipinfo.io/${ip}/json`));

  if (ipInfoData.loc) {
    const [lat, long] = ipInfoData.loc.split(",");
    geolocation = { long, lat };
  }

  if (ipInfoData.loc) {
    const [lat, long] = ipInfoData.loc.split(",");
    geolocation = { long, lat };
  }

  hostname = ipInfoData.hostname || "unknown";
  city = ipInfoData.city || "unknown";
  region = ipInfoData.region || "unknown";
  country = ipInfoData.country || "unknown";

  return {
    ip: ip,
    geolocation,
    hostname,
    city,
    region,
    country,
  };
}

export { generateDeviceDataLogger, ipTracker };
