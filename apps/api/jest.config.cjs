module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testRegex: ".*\\.spec\\.ts$",
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    "^@fxradar/shared-types$": "<rootDir>/../../packages/shared-types/src/index.ts",
  },
};
