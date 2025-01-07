import dns from "dns";
import path from "path";
import fs from "fs";
import axios from "axios";
import { exec } from "child_process";

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

async function ipTracker(
  ip: string = "",
  ipInfoKey: string
): Promise<{
  ip: string;
  privacy: string | void;
  geolocation: {
    long: string | void;
    lat: string | void;
  };
  hostname: string | void;
  city: string | void;
  region: string | void;
  country: string | void;
}> {
  if (!ip) {
    throw new Error("Invalid IP address.");
  }

  let geolocation = { long: "unknown", lat: "unknown" };
  let hostname = "unknown";
  let city = "unknown";
  let region = "unknown";
  let country = "unknown";
  let privacy = "unknown";

  const curlCommand = `curl -s -H "Authorization: Bearer ${ipInfoKey}" https://ipinfo.io/${ip}`;

  return new Promise((resolve, reject) => {
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      const ipInfoData = JSON.parse(stdout);

      if (ipInfoData.loc) {
        const [lat, long] = ipInfoData.loc.split(",");
        geolocation = { long, lat };
      }

      hostname = ipInfoData.hostname || "unknown";
      city = ipInfoData.city || "unknown";
      region = ipInfoData.region || "unknown";
      country = ipInfoData.country || "unknown";
      privacy = ipInfoData.privacy || "unknown";

      resolve({
        ip,
        privacy,
        geolocation,
        hostname,
        city,
        region,
        country,
      });
    });
  });
}

async function hostResolver(
  hostname: string,
  retries: number,
  timeout: number
): Promise<{
  status: boolean;
  error_message: string;
}> {
  let error_message = "";

  if (!hostname || !retries || !timeout) {
    return {
      status: false,
      error_message: "Invalid parameters provided.",
    };
  }

  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((resolve, reject) => {
        dns.resolve(hostname, err => {
          if (err) {
            error_message = err.message;
            reject(err);
          } else {
            resolve(null);
          }
        });
      });
      return {
        status: true,
        error_message: "",
      };
    } catch (err) {
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, timeout));
      }
    }
  }

  return {
    status: false,
    error_message: error_message,
  };
}

export { generateDeviceDataLogger, ipTracker, hostResolver };
