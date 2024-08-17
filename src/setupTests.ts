import '@testing-library/jest-dom';

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
