module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@airbrake/(.*)$': '<rootDir>/../$1/src',
  },
  roots: ['tests'],
  clearMocks: true,
};
