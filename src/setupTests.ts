import '@testing-library/jest-dom/vitest';
import 'src/i18n/i18n';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock ResizeObserver in tests
// eslint-disable-next-line @typescript-eslint/no-require-imports
global.ResizeObserver = require('resize-observer-polyfill');

vi.mock('./commons/utils/notifications/createNotification', () => ({
  notification: {
    show: vi.fn(),
  },
}));

vi.mock('java-slang', () => {
  return {
    compileFromSource: () => '',
    typeCheck: () => ({ hasTypeErrors: false, errorMsgs: [] }),
  };
});

// Fix for react-router v7 and vitest
// https://stackoverflow.com/a/79332264

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder as any;
}

// JSDOM does not implement window.matchMedia, so we have to mock it.
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

// JSDOM does not implement scrollIntoView, so we have to mock it.
window.HTMLElement.prototype.scrollIntoView = function () {};

// Needed when using RTL without Vitest globals
// https://testing-library.com/docs/react-testing-library/setup#auto-cleanup-in-vitest
afterEach(() => {
  cleanup();
});
