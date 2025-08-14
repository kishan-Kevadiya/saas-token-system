import { type Config } from 'jest';

const testRegex = '(/__tests__/.*|(\\.|/)(test|spec))\\.(js?|ts?)?$';
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex,
  verbose: true,
  notify: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
