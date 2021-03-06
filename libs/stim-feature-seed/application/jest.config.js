module.exports = {
  name: 'stim-feature-seed-application',
  preset: '../../../jest.config.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/stim-feature-seed/application',
  globals: { 'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' } },
};
