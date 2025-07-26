import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'node:util';

// Mock ResizeObserver in tests
// eslint-disable-next-line @typescript-eslint/no-require-imports
global.ResizeObserver = require('resize-observer-polyfill');

jest.mock('./commons/utils/notifications/createNotification', () => ({
  notification: {
    show: jest.fn()
  }
}));

jest.mock('java-slang', () => {
  return {
    compileFromSource: () => '',
    typeCheck: () => ({ hasTypeErrors: false, errorMsgs: [] })
  };
});

// Fix for react-router v7 and jest
// https://stackoverflow.com/a/79332264

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder as any;
}
