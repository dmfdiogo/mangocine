/* eslint-env jest */
// Mock react-native-safe-area-context
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const RealComponent = jest.requireActual('react-native-screens');
  RealComponent.enableScreens = jest.fn();
  return RealComponent;
});

// AsyncStorage has an official Jest mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest').default
);

// FastImage native module is not available in tests
jest.mock('@d11/react-native-fast-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockFastImage = (props) => React.createElement(View, props, props.children);
  MockFastImage.priority = { low: 'low', normal: 'normal', high: 'high' };
  MockFastImage.cacheControl = {
    immutable: 'immutable',
    web: 'web',
    cacheOnly: 'cacheOnly',
  };
  MockFastImage.resizeMode = {
    cover: 'cover',
    contain: 'contain',
    stretch: 'stretch',
    center: 'center',
  };
  MockFastImage.preload = jest.fn();
  return { __esModule: true, default: MockFastImage };
});
