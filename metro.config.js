const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;

/**
 * Directories that are never part of the JS bundle. Excluding them from the
 * watcher stops Metro from rebuilding/reloading when native dependencies,
 * builds or local tooling change (e.g. `pod install`, Xcode/Gradle builds).
 * `node_modules` is intentionally NOT excluded — Metro needs it to resolve.
 */
const IGNORED_DIRS = [
  'ios/Pods',
  'ios/build',
  'android/.gradle',
  'android/build',
  'android/app/build',
  '.opencode',
  '.bundle',
  'vendor',
  'coverage',
  'tmp',
];

const escapeForRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const config = {
  resolver: {
    blockList: IGNORED_DIRS.map((dir) => {
      const absolute = escapeForRegex(path.join(projectRoot, dir));
      return new RegExp(`${absolute}[/\\\\]`);
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
