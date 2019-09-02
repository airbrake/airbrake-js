module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@browser/(.*)$': '<rootDir>/../browser/src/$1',
  },
  roots: ['tests'],
  clearMocks: true,
};
