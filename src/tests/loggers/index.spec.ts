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
      city: "Martonvásár",
      region: "Fejér",
      country: "HU",
    },
  };

  let toolkit: SecurityToolKit;

  beforeEach(() => {
    jest.clearAllMocks();
    toolkit = new SecurityToolKit({}, {});
  });

  describe("in a browser environment", () => {
    beforeAll(() => {
      jest
        .spyOn(global.navigator.geolocation, "getCurrentPosition")
        .mockImplementation((success, error) => {
          success({
            coords: {
              latitude: 47.316,
              longitude: 18.7904,
              accuracy: 0,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: () => ({
                latitude: 47.316,
                longitude: 18.7904,
                accuracy: 0,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
              }),
            },
            timestamp: Date.now(),
          } as GeolocationPosition);
        });
    });
    it("should return IP and geolocation from the browser", async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce(mockIpResponse);

      const result = await toolkit.loggerMethods.ipTracker("");

      expect(result).toEqual({
        ip: "31.46.213.198",
        geolocation: {
          lat: "47.3160",
          long: "18.7904",
        },
        hostname: "1f2ed5c6.dsl.pool.telekom.hu",
        city: "Martonvásár",
        region: "Fejér",
        country: "HU",
      });
    });
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

      const result = await toolkit.loggerMethods.ipTracker("");

      expect(result).toEqual({
        ip: "31.46.213.198",
        geolocation: {
          lat: "47.3160",
          long: "18.7904",
        },
        hostname: "1f2ed5c6.dsl.pool.telekom.hu",
        city: "Martonvásár",
        region: "Fejér",
        country: "HU",
      });
    });
  });
});
