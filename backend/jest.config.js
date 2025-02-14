const { pathsToModuleNameMapper } = require('ts-jest');

const config = {
  rootDir: '.',
  preset: 'ts-jest',
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testPathIgnorePatterns: ['.d.ts', '.js'],
  modulePathIgnorePatterns: ['<rootDir>/config'],
  moduleNameMapper: pathsToModuleNameMapper(
    {
      '@services/*': ['src/services/*'],
      '@api/*': ['src/api/*'],
      '@app/*': ['src/*'],
      '@db/*': ['src/database/*'],
      '@tests/*': ['tests/*'],    },
    {
      prefix: '<rootDir>/',
    }
  ),
  // transform: {
  //     '^.+\\.tsx?$': 'ts-jest',
  //     "node_modules/variables/.+\\.(j|t)sx?$": "ts-jest"
  // },
  // transformIgnorePatterns: [
  //     "node_modules/(?!variables/.*)"
  // ]
};

module.exports = config;
