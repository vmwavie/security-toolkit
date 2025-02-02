module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "ts", "js", "js", "json", "node"],
  setupFiles: ["<rootDir>/src/tests/setupTests.ts"],
};
