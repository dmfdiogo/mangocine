module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|react-redux|@reduxjs/toolkit)/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    // Barrel files only re-export; they add no logic to cover.
    '!src/**/index.ts',
    '!src/types/**',
  ],
  coverageReporters: ['text-summary', 'lcov'],
  // Floors set slightly below the current baseline so small refactors don't
  // fail the build, while still blocking coverage regressions.
  coverageThreshold: {
    global: {
      statements: 93,
      branches: 83,
      functions: 93,
      lines: 93,
    },
  },
};
