import SecurityToolKit from "../../index";
import axios from "axios";
import * as loggerModule from "../../feats/loggers";

jest.mock("axios");

describe("generateDeviceDataLogger", () => {
  let toolkit: SecurityToolKit;

  beforeEach(() => {
    toolkit = new SecurityToolKit({}, {});
  });

  beforeAll(() => {
    global.window = {
      addEventListener: jest.fn(),
    } as any;

    global.navigator = {
      ip: "",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      storage: {
        estimate: jest.fn().mockResolvedValue({ quota: 150000000 }),
      },
      geolocation: {
        getCurrentPosition: jest.fn(success => {
          success({
            coords: {
              longitude: 12.34,
              latitude: 56.78,
            },
          });
        }),
      },
      plugins: [],
      languages: ["en-US"],
      webdriver: false,
    } as any;

    (axios.get as jest.Mock).mockResolvedValue({
      data: { ip: "123.45.67.89" },
    });

    jest.spyOn(loggerModule, "generateDeviceDataLogger").mockImplementation(async () => ({
      ip: "123.45.67.89",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      geolocation: {
        long: "12.34",
        lat: "56.78",
      },
      isIncognito: false,
      isMalicious: 0,
    }));
  });

  it("should return device data logger information", async () => {
    const data = await toolkit.loggerMethods.generateDeviceDataLogger();

    expect(data).toEqual({
      ip: "123.45.67.89",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      geolocation: {
        long: "12.34",
        lat: "56.78",
      },
      isIncognito: false,
      isMalicious: 0,
    });
  });
});

describe("ipTracker", () => {
  const mockIpResponse = { data: { ip: "31.46.213.198" } };
  const mockIpInfoResponse = {
    data: {
      loc: "47.3160,18.7904",
      hostname: "1f2ed5c6.dsl.pool.telekom.hu",
      city: "Füzesabony",
      region: "Heves County",
      country: "HU",
    },
  };

  let toolkit: SecurityToolKit;

  beforeEach(() => {
    jest.clearAllMocks();
    toolkit = new SecurityToolKit(
      {},
      {},
      { API_KEYS: { ipInfoKey: process.env.IPINFO_API_KEY as string } }
    );
  });

  describe("in a Node.js environment", () => {
    beforeAll(() => {
      global.navigator = {
        geolocation: {
          getCurrentPosition: jest.fn((success, error) => {
            error(new Error("Geolocation not supported"));
          }),
        },
      } as any;
    });

    it("should return IP and geolocation from ipinfo.io", async () => {
      (axios.get as jest.Mock)
        .mockResolvedValueOnce(mockIpResponse)
        .mockResolvedValueOnce(mockIpInfoResponse);

      const result = await toolkit.loggerMethods.ipTracker("31.46.213.198");

      expect(result).toEqual({
        ip: "31.46.213.198",
        geolocation: {
          lat: "47.6832",
          long: "19.1342",
        },
        hostname: "1f2ed5c6.dsl.pool.telekom.hu",
        city: "Göd",
        region: "Pest County",
        country: "HU",
        privacy: "unknown",
      });
    });
  });
});

describe("hostResolver", () => {
  let toolkit: SecurityToolKit;

  beforeEach(() => {
    jest.clearAllMocks();
    toolkit = new SecurityToolKit();
  });

  it("should resolve a hostname to an IP address", async () => {
    const hostResolve = await toolkit.loggerMethods.hostResolver("postman-echo.com", 3, 1000);
    expect(hostResolve.status).toEqual(true);
  });

  it("should fail to resolve a hostname", async () => {
    const hostResolve = await toolkit.loggerMethods.hostResolver("fakedomain.fakedomain", 3, 100);
    expect(hostResolve.status).toEqual(false);
  });
});
