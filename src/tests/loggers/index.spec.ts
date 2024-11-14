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
